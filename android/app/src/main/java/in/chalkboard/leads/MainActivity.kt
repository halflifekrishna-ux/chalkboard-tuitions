package `in`.chalkboard.leads

import android.Manifest
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.service.notification.NotificationListenerService
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.LifecycleResumeEffect
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val Gold = Color(0xFFC9A227)
private val Cream = Color(0xFFF5F0E8)
private val Bg = Color(0xFF0F2019)
private val Card = Color(0xFF162D24)
private val Danger = Color(0xFFE8A090)

private fun JSONArray.objects() = List(length()) { getJSONObject(it) }
private fun JSONObject.str(k: String) = if (isNull(k)) "" else optString(k)

class MainActivity : ComponentActivity() {
    private val promptIntent = mutableStateOf<Intent?>(null)
    private val askContacts = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        channels(this)
        ReminderWorker.schedule(this)
        promptIntent.value = intent
        val perms = mutableListOf(Manifest.permission.READ_CONTACTS)
        if (Build.VERSION.SDK_INT >= 33) perms.add(Manifest.permission.POST_NOTIFICATIONS)
        askContacts.launch(perms.toTypedArray())
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(primary = Gold, onPrimary = Card, background = Bg, surface = Card, onSurface = Cream, onBackground = Cream)) {
                Surface(Modifier.fillMaxSize(), color = Bg) { App(promptIntent) }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        promptIntent.value = intent
    }
}

private sealed interface Screen {
    data object Home : Screen
    data class NewLead(val name: String, val phone: String, val text: String) : Screen
    data class Lead(val lead: JSONObject) : Screen
    data object Settings : Screen
    data object Setup : Screen
    data object Accounts : Screen
    data object OsHome : Screen
    data class Roster(val classId: String, val date: String) : Screen
    data object AddStudent : Screen
    data object Queue : Screen
}

/** What gets recorded once staff come back from WhatsApp and confirm they sent it. */
private class PendingSend(val label: String, val onSent: suspend () -> Unit)

private class AppState(val store: Store, val api: Api) {
    var screen by mutableStateOf<Screen>(Screen.Home)
    var profile by mutableStateOf<JSONObject?>(null)
    var boot by mutableStateOf<JSONObject?>(null)
    var error by mutableStateOf<String?>(null)
    var signedIn by mutableStateOf(store.active() != null)
    var needsPin by mutableStateOf(false)
    var switchTo by mutableStateOf<Account?>(null)
    var addingAccount by mutableStateOf(false)
    var pending by mutableStateOf<PendingSend?>(null)
    var refresh by mutableIntStateOf(0)

    fun back() {
        screen = when (screen) {
            is Screen.Roster, Screen.AddStudent, Screen.Queue -> Screen.OsHome
            Screen.OsHome, Screen.Setup, Screen.Accounts -> Screen.Settings
            else -> Screen.Home
        }
    }
}

@Composable
private fun App(promptIntent: State<Intent?>) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val state = remember { Store(ctx).let { AppState(it, Api(it)) } }
    val scope = rememberCoroutineScope()
    var askSent by remember { mutableStateOf(false) }

    suspend fun loadProfile() {
        try {
            val me = state.api.get("me").getJSONObject("profile")
            state.profile = me
            state.needsPin = !me.getBoolean("has_pin")
            state.boot = state.api.get("bootstrap")
        } catch (e: ApiException) {
            if (e.status == 401 || e.status == 403) {
                state.store.activeId?.let(state.store::removeAccount)
                state.signedIn = state.store.active() != null
            }
            state.error = e.message
        }
    }

    LaunchedEffect(state.signedIn, state.store.activeId) { if (state.signedIn) loadProfile() }

    LaunchedEffect(promptIntent.value, state.signedIn) {
        val i = promptIntent.value ?: return@LaunchedEffect
        if (!state.signedIn) return@LaunchedEffect
        if (i.hasExtra(EXTRA_PROMPT_NOTIF)) {
            ctx.getSystemService(NotificationManager::class.java).cancel(i.getIntExtra(EXTRA_PROMPT_NOTIF, 0))
            state.screen = Screen.NewLead(i.getStringExtra(EXTRA_PROMPT_NAME).orEmpty(), i.getStringExtra(EXTRA_PROMPT_PHONE).orEmpty(), i.getStringExtra(EXTRA_PROMPT_TEXT).orEmpty())
            i.removeExtra(EXTRA_PROMPT_NOTIF)
        } else if (i.getBooleanExtra(EXTRA_OPEN_DUE, false)) {
            state.screen = Screen.Home
            i.removeExtra(EXTRA_OPEN_DUE)
        }
    }

    LifecycleResumeEffect(Unit) {
        if (state.pending != null) askSent = true
        state.refresh++
        onPauseOrDispose {}
    }

    Column(Modifier.fillMaxSize().systemBarsPadding().imePadding()) {
        state.error?.let { msg ->
            Row(Modifier.fillMaxWidth().background(Color(0xFF4A2A22)).clickable { state.error = null }.padding(12.dp)) {
                Text(msg, color = Danger, modifier = Modifier.weight(1f))
                Text("✕", color = Danger)
            }
        }
        when {
            !state.signedIn || state.addingAccount -> LoginScreen(state)
            state.switchTo != null -> SwitchScreen(state)
            state.profile == null -> Centered("Loading…")
            state.needsPin -> PinSetScreen(state)
            else -> when (val s = state.screen) {
                Screen.Home -> HomeScreen(state)
                is Screen.NewLead -> NewLeadScreen(state, s)
                is Screen.Lead -> LeadScreen(state, s.lead)
                Screen.Settings -> SettingsScreen(state)
                Screen.Setup -> SetupScreen(state)
                Screen.Accounts -> AccountsScreen(state)
                Screen.OsHome -> OsHomeScreen(state)
                is Screen.Roster -> RosterScreen(state, s)
                Screen.AddStudent -> AddStudentScreen(state)
                Screen.Queue -> QueueScreen(state)
            }
        }
    }

    if (state.screen != Screen.Home && state.signedIn) BackHandler { state.back() }

    val pending = state.pending
    if (askSent && pending != null) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text("Did you send it?") },
            text = { Text(pending.label) },
            confirmButton = {
                TextButton(onClick = {
                    askSent = false
                    state.pending = null
                    scope.launch {
                        try { pending.onSent(); state.refresh++ } catch (e: ApiException) { state.error = e.message }
                    }
                }) { Text("Yes, sent") }
            },
            dismissButton = { TextButton(onClick = { askSent = false; state.pending = null }) { Text("Not sent") } },
        )
    }
}

@Composable private fun Centered(text: String) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(text, color = Cream) }
}

@Composable private fun Title(text: String, onBack: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
        onBack?.let { Text("←  ", color = Gold, style = MaterialTheme.typography.titleLarge, modifier = Modifier.clickable(onClick = it)) }
        Text(text, color = Cream, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
    }
}

@Composable private fun Box2(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    Surface(modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp), color = Card, shape = MaterialTheme.shapes.medium) {
        Column((if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(14.dp), content = content)
    }
}

@Composable private fun Big(text: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(onClick, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp).heightIn(min = 48.dp), enabled = enabled) { Text(text, fontWeight = FontWeight.Bold) }
}

@Composable private fun Quiet(text: String, onClick: () -> Unit) {
    OutlinedButton(onClick, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp)) { Text(text, color = Cream) }
}

@Composable private fun Field(label: String, value: String, keyboard: KeyboardType = KeyboardType.Text, secret: Boolean = false, onChange: (String) -> Unit) {
    OutlinedTextField(
        value, onChange, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp), label = { Text(label) },
        keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        visualTransformation = if (secret) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable private fun Chips(options: List<Pair<String, String>>, selected: String?, onPick: (String) -> Unit) {
    FlowRow(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { (k, label) -> FilterChip(selected == k, { onPick(k) }, { Text(label) }) }
    }
}

private fun openWhatsApp(ctx: android.content.Context, phone: String, text: String): Boolean {
    val uri = Uri.parse("https://api.whatsapp.com/send?phone=${normalise(phone)}" + if (text.isNotEmpty()) "&text=${Uri.encode(text)}" else "")
    return runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, uri).setPackage("com.whatsapp.w4b")); true }.getOrDefault(false)
}

private fun whenText(iso: String): String {
    if (iso.isEmpty()) return ""
    return runCatching {
        DateTimeFormatter.ofPattern("d MMM, h:mm a").withZone(ZoneId.of("Asia/Kolkata")).format(Instant.parse(iso.replace("+00:00", "Z")))
    }.getOrDefault(iso)
}

private fun plusDaysIso(days: Long) = Instant.now().plusSeconds(days * 86_400).toString()

// ── Sign in, PIN, switching ─────────────────────────────────────────────────

@Composable private fun LoginScreen(state: AppState) {
    var email by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Chalkboard Leads", if (state.addingAccount) ({ state.addingAccount = false }) else null)
        Text("Sign in with your Chalkboard OS account.", color = Cream.copy(alpha = .7f), modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp))
        Field("Email", email, KeyboardType.Email) { email = it.trim() }
        Field("Password", pass, KeyboardType.Password, secret = true) { pass = it }
        Big(if (busy) "Signing in…" else "Sign in", enabled = !busy && email.isNotEmpty() && pass.isNotEmpty()) {
            busy = true
            scope.launch {
                try {
                    state.profile = null
                    state.api.login(email, pass)
                    state.signedIn = true
                    state.addingAccount = false
                    state.screen = Screen.Home
                } catch (e: ApiException) { state.error = e.message } finally { busy = false }
            }
        }
    }
}

@Composable private fun PinSetScreen(state: AppState) {
    var pin by remember { mutableStateOf("") }
    var again by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Column {
        Title("Choose your PIN")
        Text("4 digits, private to you. You'll use it to switch to your account on this phone.", color = Cream.copy(alpha = .7f), modifier = Modifier.padding(horizontal = 16.dp))
        Field("PIN", pin, KeyboardType.NumberPassword, secret = true) { pin = it.filter(Char::isDigit).take(4) }
        Field("PIN again", again, KeyboardType.NumberPassword, secret = true) { again = it.filter(Char::isDigit).take(4) }
        Big("Save PIN", enabled = pin.length == 4 && pin == again) {
            scope.launch {
                try {
                    val r = state.api.post("pin/set", JSONObject().put("new_pin", pin))
                    if (r.optBoolean("ok")) state.needsPin = false else state.error = "Couldn't save your PIN. Please try again."
                } catch (e: ApiException) { state.error = e.message }
            }
        }
    }
}

private fun pinError(r: JSONObject) = when (r.optString("error")) {
    "wrong_pin" -> "Wrong PIN."
    "locked" -> "Too many wrong tries. Try again in 15 minutes."
    "no_pin" -> "Set a PIN first."
    else -> "Couldn't check your PIN."
}

@Composable private fun SwitchScreen(state: AppState) {
    val target = state.switchTo!!
    val previous = remember { state.store.activeId }
    var pin by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Column {
        Title("Switch to ${target.name}", { state.switchTo = null })
        Field("${target.name}'s PIN", pin, KeyboardType.NumberPassword, secret = true) { pin = it.filter(Char::isDigit).take(4) }
        Big("Switch", enabled = pin.length == 4) {
            scope.launch {
                state.store.activeId = target.id
                try {
                    val r = state.api.post("pin/verify", JSONObject().put("pin", pin))
                    if (r.optBoolean("ok")) {
                        state.api.osUnlock = null
                        state.profile = null
                        state.switchTo = null
                        state.screen = Screen.Home
                    } else {
                        state.store.activeId = previous
                        state.error = pinError(r)
                    }
                } catch (e: ApiException) {
                    state.store.activeId = previous
                    state.error = e.message
                }
            }
        }
    }
}

@Composable private fun AccountsScreen(state: AppState) {
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Who's using the phone", { state.back() })
        state.store.accounts().forEach { a ->
            Box2(onClick = if (a.id != state.store.activeId) ({ state.switchTo = a }) else null) {
                Text(a.name, color = Cream, fontWeight = FontWeight.Bold)
                Text(if (a.id == state.store.activeId) "Using now" else "Tap to switch", color = Cream.copy(alpha = .6f))
            }
        }
        Quiet("Add a person") { state.addingAccount = true }
        Quiet("Sign ${state.profile?.str("full_name")} out of this phone") {
            state.store.activeId?.let(state.store::removeAccount)
            state.profile = null
            state.api.osUnlock = null
            state.signedIn = state.store.active() != null
            state.screen = Screen.Home
        }
    }
}

// ── Leads ───────────────────────────────────────────────────────────────────

@Composable private fun HomeScreen(state: AppState) {
    var view by remember { mutableStateOf("due") }
    var leads by remember { mutableStateOf<List<JSONObject>?>(null) }
    LaunchedEffect(view, state.refresh, state.store.activeId) {
        try { leads = state.api.get("leads?view=$view").getJSONArray("leads").objects() } catch (e: ApiException) { state.error = e.message }
    }
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.weight(1f)) { Title("Leads") }
            Text(state.profile?.str("full_name").orEmpty() + "  ⚙", color = Gold, modifier = Modifier.clickable { state.screen = Screen.Settings }.padding(16.dp))
        }
        Chips(listOf("due" to "Needs action", "open" to "All open"), view) { view = it }
        Quiet("+ Add a lead by hand") { state.screen = Screen.NewLead("", "", "") }
        val list = leads
        when {
            list == null -> Centered("Loading…")
            list.isEmpty() -> Centered(if (view == "due") "Nothing due. All caught up." else "No open leads yet.")
            else -> LazyColumn {
                items(list, key = { it.getString("id") }) { l ->
                    val reason = state.boot?.optJSONArray("reasons")?.objects()?.firstOrNull { it.str("key") == l.str("contact_reason") }?.str("label")
                    Box2(onClick = { state.screen = Screen.Lead(l) }) {
                        Text(l.str("full_name"), color = Cream, fontWeight = FontWeight.Bold)
                        Text(listOfNotNull(reason, l.str("status").replace("_", " ")).joinToString(" · "), color = Cream.copy(alpha = .7f))
                        val note = when {
                            l.optBoolean("exhausted") -> "Follow-ups finished: close or keep"
                            l.str("last_reply_at").isNotEmpty() && l.optInt("follow_up_step") == 0 -> "They replied. Answer them."
                            l.optInt("follow_up_step") == 0 -> "First reply not sent"
                            else -> "Next: " + whenText(l.str("follow_up_at"))
                        }
                        Text(note, color = Gold)
                    }
                }
            }
        }
    }
}

@Composable private fun NewLeadScreen(state: AppState, s: Screen.NewLead) {
    var name by remember { mutableStateOf(s.name) }
    var phone by remember { mutableStateOf(s.phone) }
    var reason by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val reasons = state.boot?.optJSONArray("reasons")?.objects().orEmpty().map { it.str("key") to it.str("label") }
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("New lead", { state.back() })
        if (s.text.isNotEmpty()) Box2 { Text("“${s.text}”", color = Cream.copy(alpha = .8f)) }
        Field("Name", name) { name = it }
        Field("Phone (with country code)", phone, KeyboardType.Phone) { phone = it }
        if (s.phone.isEmpty() && s.text.isNotEmpty()) {
            Text("Couldn't read this number. Check the chat and type it in.", color = Gold, modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
        }
        Text("Why are they contacting us?", color = Cream, modifier = Modifier.padding(16.dp, 10.dp, 16.dp, 2.dp))
        Chips(reasons, reason) { reason = it }
        Big("Save lead", enabled = name.isNotBlank() && normalise(phone).length >= 10 && reason != null) {
            scope.launch {
                try {
                    val r = state.api.post("leads", JSONObject().put("full_name", name.trim()).put("phone", normalise(phone)).put("reason", reason)
                        .apply { if (s.text.isNotEmpty()) put("notes", "First message: ${s.text}") })
                    if (r.optBoolean("duplicate")) state.error = "This number already has an open lead, so that one is opened."
                    state.screen = Screen.Lead(r.getJSONObject("lead"))
                } catch (e: ApiException) { state.error = e.message }
            }
        }
    }
}

@Composable private fun LeadScreen(state: AppState, initial: JSONObject) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var lead by remember(initial) { mutableStateOf(initial) }
    var note by remember { mutableStateOf("") }
    var closing by remember { mutableStateOf(false) }
    var reason by remember { mutableStateOf("") }
    val id = lead.getString("id")
    val canManage = state.profile?.optJSONArray("capabilities")?.toString()?.contains("leads.manage") == true
    val isOpen = lead.str("status") !in listOf("converted", "lost", "rejected")
    val templates = state.boot?.optJSONArray("templates")?.objects().orEmpty().filter { it.str("reason_key") == lead.str("contact_reason") }
    val staff = state.boot?.optJSONArray("staff")?.objects().orEmpty()

    fun patch(body: JSONObject) = scope.launch {
        try { lead = state.api.patch("leads/$id", body).getJSONObject("lead") } catch (e: ApiException) { state.error = e.message }
    }
    fun send(text: String, templateId: String?) {
        if (!openWhatsApp(ctx, lead.str("phone"), text)) { state.error = "WhatsApp Business isn't installed."; return }
        state.pending = PendingSend("To ${lead.str("full_name")}. This moves their follow-up schedule on.") {
            val b = JSONObject().put("template_id", templateId ?: JSONObject.NULL)
            lead = state.api.post("leads/$id/sent", b).getJSONObject("lead")
        }
    }

    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title(lead.str("full_name"), { state.back() })
        Box2 {
            Text("+" + normalise(lead.str("phone")), color = Cream)
            Text("Status: " + lead.str("status").replace("_", " "), color = Cream.copy(alpha = .7f))
            if (lead.str("follow_up_at").isNotEmpty()) Text("Next follow-up: " + whenText(lead.str("follow_up_at")), color = Gold)
            if (lead.str("notes").isNotEmpty()) Text(lead.str("notes"), color = Cream.copy(alpha = .7f))
        }
        if (isOpen && canManage) {
            Text("Reply", color = Cream, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp, 10.dp))
            templates.forEach { t ->
                Box2(onClick = { send(t.str("body"), t.str("id")) }) {
                    Text(t.str("title"), color = Gold, fontWeight = FontWeight.Bold)
                    Text(t.str("body").replace("{name}", lead.str("full_name")), color = Cream.copy(alpha = .8f))
                }
            }
            Big(if (templates.isEmpty()) "Open chat in WhatsApp" else "Write my own message") { send("", null) }
            Text("Remind me", color = Cream, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp, 10.dp))
            Chips(listOf("1" to "Tomorrow", "3" to "In 3 days", "7" to "In a week"), null) { patch(JSONObject().put("follow_up_at", plusDaysIso(it.toLong()))) }
            Text("Owner", color = Cream, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp, 10.dp))
            Chips(staff.map { it.str("id") to it.str("full_name") }, lead.str("assigned_to")) { patch(JSONObject().put("assigned_to", it)) }
            Field("Add a note", note) { note = it }
            if (note.isNotBlank()) Quiet("Save note") { patch(JSONObject().put("note", note.trim())); note = "" }
            Big("Joined: mark converted") { patch(JSONObject().put("status", "converted")) }
            Quiet("Close as lost") { closing = true }
        }
    }
    if (closing) {
        AlertDialog(
            onDismissRequest = { closing = false },
            title = { Text("Close as lost?") },
            text = { OutlinedTextField(reason, { reason = it }, label = { Text("Reason (optional)") }) },
            confirmButton = { TextButton(onClick = {
                closing = false
                patch(JSONObject().put("status", "lost").put("lost_reason", reason.trim()))
            }) { Text("Close lead") } },
            dismissButton = { TextButton(onClick = { closing = false }) { Text("Cancel") } },
        )
    }
}

// ── Settings ────────────────────────────────────────────────────────────────

@Composable private fun SettingsScreen(state: AppState) {
    val scope = rememberCoroutineScope()
    val current = state.boot?.optJSONArray("follow_up_days")?.let { a -> List(a.length()) { a.getInt(it) } }.orEmpty()
    var days by remember(current) { mutableStateOf(current.joinToString(", ")) }
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Settings", { state.back() })
        Box2 {
            Text("Follow-up schedule", color = Cream, fontWeight = FontWeight.Bold)
            Text("Days after the first reply, for everyone.", color = Cream.copy(alpha = .7f))
        }
        Field("Days, e.g. 1, 3, 7", days, KeyboardType.Text) { days = it }
        Quiet("Save schedule") {
            val parsed = days.split(",", " ").mapNotNull { it.trim().toIntOrNull() }
            scope.launch {
                try {
                    state.api.put("settings/follow-ups", JSONObject().put("days", JSONArray(parsed)))
                    state.boot = state.api.get("bootstrap")
                } catch (e: ApiException) { state.error = e.message }
            }
        }
        Quiet("Who's using the phone") { state.screen = Screen.Accounts }
        Quiet("Phone setup") { state.screen = Screen.Setup }
        if (state.profile?.optBoolean("os_access") == true) Big("Open Chalkboard OS") { state.screen = Screen.OsHome }
    }
}

@Composable private fun SetupScreen(state: AppState) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    var tick by remember { mutableIntStateOf(0) }
    LifecycleResumeEffect(Unit) { tick++; onPauseOrDispose {} }
    val listening = remember(tick) { ctx.getSystemService(NotificationManager::class.java).isNotificationListenerAccessGranted(ComponentName(ctx, WhatsAppListener::class.java)) }
    val unrestricted = remember(tick) { ctx.getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(ctx.packageName) }
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Phone setup", { state.back() })
        Box2 {
            Text((if (listening) "✓ " else "✕ ") + "Reads WhatsApp notifications", color = Cream)
            Text((if (unrestricted) "✓ " else "✕ ") + "Battery unrestricted", color = Cream)
            val heard = state.store.lastHeard
            Text("Last WhatsApp notification seen: " + if (heard == 0L) "never" else whenText(Instant.ofEpochMilli(heard).toString()), color = Cream.copy(alpha = .7f))
        }
        Quiet("Allow reading notifications") { ctx.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        Quiet("Battery settings for this app") {
            ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}")))
        }
        Big("Reconnect to notifications") {
            NotificationListenerService.requestRebind(ComponentName(ctx, WhatsAppListener::class.java))
        }
        Text("WhatsApp notifications must stay on. Muted chats, or chats open on screen, can't be seen by this app.", color = Gold, modifier = Modifier.padding(16.dp))
    }
}

// ── Boon's OS section ───────────────────────────────────────────────────────

@Composable private fun OsHomeScreen(state: AppState) {
    val scope = rememberCoroutineScope()
    var pin by remember { mutableStateOf("") }
    var classes by remember { mutableStateOf<List<JSONObject>?>(null) }
    val today = remember { LocalDate.now(ZoneId.of("Asia/Kolkata")).toString() }
    var date by remember { mutableStateOf(today) }
    val unlocked = state.api.osUnlock != null

    LaunchedEffect(unlocked, date) {
        if (!unlocked) return@LaunchedEffect
        try { classes = state.api.get("os/classes?date=$date").getJSONArray("classes").objects() }
        catch (e: ApiException) { if (e.code == "os_locked") state.api.osUnlock = null; state.error = e.message }
    }
    if (!unlocked) {
        Column {
            Title("Chalkboard OS", { state.back() })
            Field("Your PIN", pin, KeyboardType.NumberPassword, secret = true) { pin = it.filter(Char::isDigit).take(4) }
            Big("Open", enabled = pin.length == 4) {
                scope.launch {
                    try {
                        val r = state.api.post("pin/verify", JSONObject().put("pin", pin))
                        if (r.optBoolean("ok")) { state.api.osUnlock = r.getString("token"); state.refresh++; pin = "" } else state.error = pinError(r)
                    } catch (e: ApiException) { state.error = e.message }
                }
            }
        }
        return
    }
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Chalkboard OS", { state.back() })
        Big("Add a student") { state.screen = Screen.AddStudent }
        Quiet("Parent messages to send") { state.screen = Screen.Queue }
        Field("Attendance date (YYYY-MM-DD)", date) { date = it }
        Text("Classes", color = Cream, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp, 10.dp))
        val list = classes
        if (list != null && list.isEmpty()) Text("No classes on this day.", color = Cream.copy(alpha = .7f), modifier = Modifier.padding(horizontal = 16.dp))
        list?.forEach { c ->
            Box2(onClick = { state.screen = Screen.Roster(c.getString("id"), date) }) {
                Text(c.str("name"), color = Cream, fontWeight = FontWeight.Bold)
                Text(c.str("start_time").take(5) + if (c.str("session_category") == "individual_attention") " · Individual Attention" else "", color = Cream.copy(alpha = .7f))
            }
        }
    }
}

@Composable private fun RosterScreen(state: AppState, s: Screen.Roster) {
    val scope = rememberCoroutineScope()
    var data by remember { mutableStateOf<JSONObject?>(null) }
    val marks = remember { mutableStateMapOf<String, String>() }
    var topic by remember { mutableStateOf("") }
    var homework by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    LaunchedEffect(s) {
        try {
            val d = state.api.get("os/classes/${s.classId}/roster?date=${s.date}")
            data = d
            d.getJSONArray("students").objects().forEach { marks[it.getString("id")] = it.str("status") }
            d.optJSONObject("session")?.let { topic = it.str("topic_covered"); homework = it.str("homework_assigned"); notes = it.str("teacher_notes") }
        } catch (e: ApiException) { state.error = e.message; state.back() }
    }
    val d = data ?: return Centered("Loading…")
    val batch = d.getJSONObject("batch")
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title(batch.str("name"), { state.back() })
        Text(s.date, color = Cream.copy(alpha = .7f), modifier = Modifier.padding(horizontal = 16.dp))
        if (batch.str("start_time").isEmpty()) Text("This class has no time set. Add one on the website first.", color = Gold, modifier = Modifier.padding(16.dp))
        d.getJSONArray("students").objects().forEach { st ->
            val id = st.getString("id")
            Box2 {
                Text(st.str("full_name"), color = Cream, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
            }
            Chips(listOf("present" to "Present", "absent" to "Absent", "late" to "Late", "excused" to "Excused"), marks[id]) { marks[id] = it }
        }
        Field("Today's topic", topic) { topic = it }
        Field("Homework", homework) { homework = it }
        Field("Teacher notes", notes) { notes = it }
        Big(if (saving) "Saving…" else "Save attendance", enabled = !saving && marks.isNotEmpty() && batch.str("start_time").isNotEmpty()) {
            saving = true
            scope.launch {
                try {
                    val arr = JSONArray()
                    marks.forEach { (k, v) -> arr.put(JSONObject().put("studentId", k).put("status", v)) }
                    val r = state.api.post("os/attendance", JSONObject().put("batchId", s.classId).put("sessionDate", s.date)
                        .put("startTime", batch.str("start_time")).put("endTime", batch.str("end_time").ifEmpty { JSONObject.NULL })
                        .put("subjectIds", JSONArray()).put("marks", arr).put("topic", topic).put("homework", homework).put("teacherNotes", notes))
                    if (r.optBoolean("ok")) state.screen = Screen.Queue else state.error = r.optString("error", "Couldn't save.")
                } catch (e: ApiException) { state.error = e.message } finally { saving = false }
            }
        }
    }
}

@Composable private fun AddStudentScreen(state: AppState) {
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf("") }
    var grade by remember { mutableStateOf("") }
    var board by remember { mutableStateOf<String?>(null) }
    var parent by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var school by remember { mutableStateOf("") }
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Title("Add a student", { state.back() })
        Field("Student's name", name) { name = it }
        Field("Grade (1-12)", grade, KeyboardType.Number) { grade = it.filter(Char::isDigit).take(2) }
        Chips(listOf("cbse" to "CBSE", "icse" to "ICSE", "state_board" to "State board"), board) { board = it }
        Field("School (optional)", school) { school = it }
        Field("Parent's name", parent) { parent = it }
        Field("Parent's phone", phone, KeyboardType.Phone) { phone = it }
        Big("Save student", enabled = name.length >= 2 && grade.isNotEmpty() && board != null && parent.length >= 2 && normalise(phone).length >= 10) {
            scope.launch {
                try {
                    state.api.post("os/students", JSONObject().put("full_name", name.trim()).put("grade", grade.toInt()).put("board", board)
                        .put("school_name", school.trim()).put("parent_name", parent.trim()).put("parent_phone", "+" + normalise(phone)))
                    state.screen = Screen.OsHome
                } catch (e: ApiException) { state.error = e.message }
            }
        }
    }
}

@Composable private fun QueueScreen(state: AppState) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    var messages by remember { mutableStateOf<List<JSONObject>?>(null) }
    LaunchedEffect(state.refresh) {
        try { messages = state.api.get("os/queue").getJSONArray("messages").objects() } catch (e: ApiException) { state.error = e.message }
    }
    Column(Modifier.fillMaxSize()) {
        Title("Parent messages", { state.back() })
        val list = messages
        when {
            list == null -> Centered("Loading…")
            list.isEmpty() -> Centered("Nothing waiting to be sent.")
            else -> LazyColumn {
                items(list, key = { it.getString("id") }) { m ->
                    Box2(onClick = {
                        if (openWhatsApp(ctx, m.str("to_number"), m.str("body"))) {
                            state.pending = PendingSend("To ${m.str("student_name")}'s parent.") { state.api.post("os/queue/${m.getString("id")}/sent") }
                        } else state.error = "WhatsApp Business isn't installed."
                    }) {
                        Text(m.str("student_name"), color = Cream, fontWeight = FontWeight.Bold)
                        Text(m.str("body"), color = Cream.copy(alpha = .7f))
                        Text("Tap to open in WhatsApp", color = Gold)
                    }
                }
            }
        }
    }
}
