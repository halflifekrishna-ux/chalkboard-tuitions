package `in`.chalkboard.leads

import android.Manifest
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.LifecycleResumeEffect
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private const val OS_HOST = "www.chalkboardlearning.in"
private val IST = ZoneId.of("Asia/Kolkata")

private val Paper = Color(0xFFF7F4EE)
private val Sheet = Color(0xFFFFFFFF)
private val Ink = Color(0xFF1F2A26)
private val Muted = Color(0xFF68736D)
private val Line = Color(0xFFE7E2D8)
private val Pine = Color(0xFF1F4D3A)
private val PineSoft = Color(0xFFE3EEE8)
private val Honey = Color(0xFF8A6414)
private val HoneySoft = Color(0xFFF6ECD3)
private val Clay = Color(0xFFA6472F)
private val ClaySoft = Color(0xFFF8E6E0)

private fun JSONArray.objects() = List(length()) { getJSONObject(it) }
private fun JSONObject.str(k: String) = if (isNull(k)) "" else optString(k)

class MainActivity : ComponentActivity() {
    private val promptIntent = mutableStateOf<Intent?>(null)
    private val askContacts = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        channels(this)
        ReminderWorker.schedule(this)
        promptIntent.value = intent
        val perms = mutableListOf(Manifest.permission.READ_CONTACTS)
        if (Build.VERSION.SDK_INT >= 33) perms.add(Manifest.permission.POST_NOTIFICATIONS)
        askContacts.launch(perms.toTypedArray())
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(
                primary = Pine, onPrimary = Paper, secondary = Pine, background = Paper, surface = Sheet, surfaceContainerHigh = Sheet,
                onSurface = Ink, onBackground = Ink, onSurfaceVariant = Muted, outline = Line, primaryContainer = PineSoft, onPrimaryContainer = Pine,
            )) {
                Surface(Modifier.fillMaxSize(), color = Paper) { App(promptIntent) }
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
    data class NewLead(val name: String, val phone: String, val text: String, val notif: Int? = null) : Screen
    data class Lead(val lead: JSONObject) : Screen
    data object Settings : Screen
    data object Setup : Screen
    data object Accounts : Screen
    data object OsHome : Screen
    data object FullOs : Screen
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
    var toast by mutableStateOf<String?>(null)
    var signedIn by mutableStateOf(store.active() != null)
    var needsPin by mutableStateOf(false)
    var loadFailed by mutableStateOf(false)
    var loadAttempt by mutableIntStateOf(0)
    var switchTo by mutableStateOf<Account?>(null)
    var addingAccount by mutableStateOf(false)
    var pending by mutableStateOf<PendingSend?>(null)
    var refresh by mutableIntStateOf(0)
    var saving by mutableStateOf(false)
    var osPage: WebView? = null

    fun back() {
        if (saving) return
        if (screen == Screen.FullOs && osPage?.canGoBack() == true) {
            osPage?.goBack()
            return
        }
        screen = when (screen) {
            is Screen.Roster, Screen.AddStudent, Screen.Queue, Screen.FullOs -> Screen.OsHome
            Screen.OsHome, Screen.Setup, Screen.Accounts -> Screen.Settings
            else -> Screen.Home
        }
    }
}

/**
 * Runs one server action at a time. Taps while it's running do nothing and Back
 * waits for it, so a slow connection can't turn into a second lead.
 */
@Stable
private class Runner(private val state: AppState, private val scope: CoroutineScope) {
    var busy by mutableStateOf(false)
        private set

    fun run(block: suspend () -> Unit) {
        if (busy) return
        busy = true
        state.saving = true
        scope.launch {
            try { block() } catch (e: ApiException) { state.error = e.message } finally {
                busy = false
                state.saving = false
            }
        }
    }
}

@Composable private fun rememberRunner(state: AppState): Runner {
    val scope = rememberCoroutineScope()
    return remember { Runner(state, scope) }
}

@Composable
private fun App(promptIntent: State<Intent?>) {
    val ctx = LocalContext.current
    val state = remember { Store(ctx).let { AppState(it, Api(it)) } }
    val scope = rememberCoroutineScope()
    var askSent by remember { mutableStateOf(false) }

    suspend fun loadProfile() {
        state.loadFailed = false
        state.store.cached("me")?.let { me ->
            val p = JSONObject(me)
            state.profile = p
            state.needsPin = !p.getBoolean("has_pin")
        }
        state.store.cached("boot")?.let { state.boot = JSONObject(it) }
        try {
            coroutineScope {
                val me = async { state.api.get("me").getJSONObject("profile") }
                val boot = async { state.api.get("bootstrap") }
                val p = me.await()
                state.store.cache("me", p.toString())
                state.profile = p
                state.needsPin = !p.getBoolean("has_pin")
                val b = boot.await()
                state.store.cache("boot", b.toString())
                state.boot = b
            }
        } catch (e: ApiException) {
            if (e.status == 401 || e.status == 403) {
                state.store.activeId?.let(state.store::removeAccount)
                state.profile = null
                state.signedIn = state.store.active() != null
                state.error = e.message
            } else if (state.profile == null) {
                state.loadFailed = true
            }
        }
    }

    LaunchedEffect(state.signedIn, state.store.activeId, state.loadAttempt) { if (state.signedIn) loadProfile() }

    LaunchedEffect(promptIntent.value, state.signedIn) {
        val i = promptIntent.value ?: return@LaunchedEffect
        if (!state.signedIn) return@LaunchedEffect
        if (i.hasExtra(EXTRA_PROMPT_NOTIF)) {
            state.screen = Screen.NewLead(i.getStringExtra(EXTRA_PROMPT_NAME).orEmpty(), i.getStringExtra(EXTRA_PROMPT_PHONE).orEmpty(),
                i.getStringExtra(EXTRA_PROMPT_TEXT).orEmpty(), i.getIntExtra(EXTRA_PROMPT_NOTIF, 0))
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

    Box(Modifier.fillMaxSize().background(Paper).systemBarsPadding().imePadding()) {
        when {
            !state.signedIn || state.addingAccount -> LoginScreen(state)
            state.switchTo != null -> SwitchScreen(state)
            state.profile == null && state.loadFailed -> Empty(Icons.Filled.Warning, "Couldn't connect", "Check the internet and try again.", "Try again") { state.loadAttempt++ }
            state.profile == null -> Loading()
            state.needsPin -> PinSetScreen(state)
            else -> Crossfade(state.screen, animationSpec = tween(160), label = "screen") { s ->
                when (s) {
                    Screen.Home -> HomeScreen(state)
                    is Screen.NewLead -> NewLeadScreen(state, s)
                    is Screen.Lead -> LeadScreen(state, s.lead)
                    Screen.Settings -> SettingsScreen(state)
                    Screen.Setup -> SetupScreen(state)
                    Screen.Accounts -> AccountsScreen(state)
                    Screen.OsHome -> OsHomeScreen(state)
                    Screen.FullOs -> FullOsScreen(state)
                    is Screen.Roster -> RosterScreen(state, s)
                    Screen.AddStudent -> AddStudentScreen(state)
                    Screen.Queue -> QueueScreen(state)
                }
            }
        }
        Column(Modifier.align(Alignment.BottomCenter).padding(16.dp)) {
            Notice(state.error, ClaySoft, Clay, Icons.Filled.Warning, 7000) { state.error = null }
            Notice(state.toast, Pine, Paper, Icons.Filled.Check, 2500) { state.toast = null }
        }
    }

    if (state.screen != Screen.Home && state.signedIn) BackHandler { state.back() }

    val pending = state.pending
    if (askSent && pending != null) {
        AlertDialog(
            onDismissRequest = {},
            containerColor = Sheet,
            shape = RoundedCornerShape(24.dp),
            title = { Text("Did you send it?") },
            text = { Text(pending.label, color = Muted) },
            confirmButton = {
                TextButton(onClick = {
                    askSent = false
                    state.pending = null
                    scope.launch {
                        try { pending.onSent(); state.refresh++; state.toast = "Noted" } catch (e: ApiException) { state.error = e.message }
                    }
                }) { Text("Yes, sent") }
            },
            dismissButton = { TextButton(onClick = { askSent = false; state.pending = null }) { Text("Not sent", color = Muted) } },
        )
    }
}

// ── Building blocks ─────────────────────────────────────────────────────────

@Composable private fun Notice(message: String?, bg: Color, fg: Color, icon: ImageVector, ms: Long, onClear: () -> Unit) {
    LaunchedEffect(message) {
        if (message != null) {
            delay(ms)
            onClear()
        }
    }
    AnimatedVisibility(message != null) {
        Row(
            Modifier.fillMaxWidth().padding(top = 8.dp).clip(RoundedCornerShape(16.dp)).background(bg).clickable(onClick = onClear).padding(14.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Icon(icon, null, tint = fg, modifier = Modifier.size(20.dp))
            Text(message.orEmpty(), color = fg, fontSize = 15.sp)
        }
    }
}

@Composable private fun Header(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null, trailing: (@Composable () -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(start = if (onBack != null) 8.dp else 20.dp, end = 12.dp, top = 12.dp, bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        onBack?.let { IconButton(it) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Ink) } }
        Column(Modifier.weight(1f).padding(start = if (onBack != null) 4.dp else 0.dp)) {
            Text(title, color = Ink, fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold, fontSize = 25.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
            subtitle?.let { Text(it, color = Muted, fontSize = 14.sp) }
        }
        trailing?.invoke()
    }
}

@Composable private fun Section(text: String) {
    Text(text, color = Muted, fontWeight = FontWeight.Medium, fontSize = 13.sp, letterSpacing = .4.sp, modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 8.dp))
}

@Composable private fun Sheet(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    Surface(modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp), color = Sheet, shape = RoundedCornerShape(20.dp), border = BorderStroke(1.dp, Line)) {
        Column((if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(16.dp), content = content)
    }
}

@Composable private fun Primary(text: String, enabled: Boolean = true, busy: Boolean = false, busyText: String = "Saving…", onClick: () -> Unit) {
    Button(
        onClick, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp).heightIn(min = 54.dp), enabled = enabled && !busy,
        shape = RoundedCornerShape(16.dp), colors = ButtonDefaults.buttonColors(disabledContainerColor = if (busy) Pine else Line, disabledContentColor = if (busy) Paper else Muted),
    ) {
        if (busy) {
            CircularProgressIndicator(Modifier.size(18.dp), color = Paper, strokeWidth = 2.dp)
            Spacer(Modifier.width(10.dp))
        }
        Text(if (busy) busyText else text, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
    }
}

@Composable private fun Secondary(text: String, color: Color = Pine, enabled: Boolean = true, onClick: () -> Unit) {
    OutlinedButton(
        onClick, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp).heightIn(min = 50.dp), enabled = enabled,
        shape = RoundedCornerShape(16.dp), border = BorderStroke(1.dp, Line),
    ) { Text(text, color = color, fontWeight = FontWeight.Medium, fontSize = 15.sp) }
}

@Composable private fun Row2(title: String, subtitle: String? = null, icon: ImageVector? = null, onClick: () -> Unit) {
    Sheet(onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            icon?.let {
                Box(Modifier.size(38.dp).clip(CircleShape).background(PineSoft), contentAlignment = Alignment.Center) { Icon(it, null, tint = Pine, modifier = Modifier.size(20.dp)) }
                Spacer(Modifier.width(12.dp))
            }
            Column(Modifier.weight(1f)) {
                Text(title, color = Ink, fontWeight = FontWeight.Medium, fontSize = 16.sp)
                subtitle?.let { Text(it, color = Muted, fontSize = 14.sp) }
            }
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Muted)
        }
    }
}

@Composable private fun Field(label: String, value: String, keyboard: KeyboardType = KeyboardType.Text, secret: Boolean = false, onChange: (String) -> Unit) {
    OutlinedTextField(
        value, onChange, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 5.dp), label = { Text(label) },
        shape = RoundedCornerShape(16.dp), keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = Sheet, unfocusedContainerColor = Sheet, unfocusedBorderColor = Line),
        visualTransformation = if (secret) PasswordVisualTransformation() else VisualTransformation.None,
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable private fun Chips(options: List<Pair<String, String>>, selected: String?, enabled: Boolean = true, onPick: (String) -> Unit) {
    FlowRow(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { (k, label) ->
            val on = selected == k
            Text(
                label, color = if (on) Paper else Ink, fontSize = 15.sp,
                modifier = Modifier.clip(RoundedCornerShape(50)).background(if (on) Pine else Sheet).border(1.dp, if (on) Pine else Line, RoundedCornerShape(50))
                    .clickable(enabled = enabled) { onPick(k) }.padding(horizontal = 16.dp, vertical = 10.dp),
            )
        }
    }
}

@Composable private fun Tabs(options: List<Pair<String, String>>, selected: String, onPick: (String) -> Unit) {
    Row(Modifier.padding(horizontal = 16.dp, vertical = 6.dp).fillMaxWidth().clip(RoundedCornerShape(50)).background(Line.copy(alpha = .6f)).padding(4.dp)) {
        options.forEach { (k, label) ->
            val on = selected == k
            Text(
                label, color = if (on) Ink else Muted, fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal, fontSize = 15.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.weight(1f).clip(RoundedCornerShape(50)).background(if (on) Sheet else Color.Transparent).clickable { onPick(k) }.padding(vertical = 9.dp),
            )
        }
    }
}

@Composable private fun Pill(text: String, bg: Color, fg: Color) {
    Text(text, color = fg, fontSize = 13.sp, fontWeight = FontWeight.Medium, modifier = Modifier.clip(RoundedCornerShape(50)).background(bg).padding(horizontal = 10.dp, vertical = 4.dp))
}

@Composable private fun Avatar(name: String) {
    Box(Modifier.size(44.dp).clip(CircleShape).background(PineSoft), contentAlignment = Alignment.Center) {
        Text(name.trim().take(1).uppercase().ifEmpty { "?" }, color = Pine, fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold, fontSize = 19.sp)
    }
}

@Composable private fun Loading(text: String? = null) {
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        CircularProgressIndicator(color = Pine, strokeWidth = 2.5.dp, modifier = Modifier.size(32.dp))
        text?.let { Text(it, color = Muted, modifier = Modifier.padding(top = 12.dp)) }
    }
}

/** Grey shapes in place of a list, so the screen never looks stuck or empty while loading. */
@Composable private fun Placeholder(rows: Int = 4) {
    val pulse by rememberInfiniteTransition(label = "pulse").animateFloat(.45f, 1f, infiniteRepeatable(tween(800), RepeatMode.Reverse), label = "alpha")
    Column(Modifier.alpha(pulse)) {
        repeat(rows) {
            Sheet {
                Box(Modifier.fillMaxWidth(.5f).height(14.dp).clip(RoundedCornerShape(7.dp)).background(Line))
                Spacer(Modifier.height(10.dp))
                Box(Modifier.fillMaxWidth(.8f).height(12.dp).clip(RoundedCornerShape(6.dp)).background(Line))
            }
        }
    }
}

@Composable private fun Empty(icon: ImageVector, title: String, subtitle: String? = null, action: String? = null, onAction: (() -> Unit)? = null) {
    Column(Modifier.fillMaxSize().padding(32.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(64.dp).clip(CircleShape).background(PineSoft), contentAlignment = Alignment.Center) { Icon(icon, null, tint = Pine, modifier = Modifier.size(30.dp)) }
        Text(title, color = Ink, fontFamily = FontFamily.Serif, fontSize = 20.sp, modifier = Modifier.padding(top = 16.dp))
        subtitle?.let { Text(it, color = Muted, modifier = Modifier.padding(top = 4.dp)) }
        if (action != null && onAction != null) TextButton(onAction, Modifier.padding(top = 8.dp)) { Text(action) }
    }
}

/** Four dots and a calm keypad. It answers as soon as the fourth digit lands. */
@Composable private fun PinPad(pin: String, busy: Boolean, onChange: (String) -> Unit) {
    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Row(Modifier.padding(vertical = 24.dp).heightIn(min = 24.dp), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            if (busy) CircularProgressIndicator(Modifier.size(24.dp), color = Pine, strokeWidth = 2.5.dp)
            else repeat(4) { i -> Box(Modifier.size(14.dp).clip(CircleShape).background(if (i < pin.length) Pine else Line)) }
        }
        listOf(listOf("1", "2", "3"), listOf("4", "5", "6"), listOf("7", "8", "9"), listOf("", "0", "⌫")).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.padding(vertical = 7.dp)) {
                row.forEach { key ->
                    if (key.isEmpty()) Spacer(Modifier.size(70.dp)) else Box(
                        Modifier.size(70.dp).clip(CircleShape).background(if (key == "⌫") Color.Transparent else Sheet)
                            .clickable(enabled = !busy) { if (key == "⌫") onChange(pin.dropLast(1)) else if (pin.length < 4) onChange(pin + key) },
                        contentAlignment = Alignment.Center,
                    ) { Text(key, color = Ink, fontSize = 24.sp) }
                }
            }
        }
    }
}

private fun openWhatsApp(ctx: Context, phone: String, text: String): Boolean {
    val uri = Uri.parse("https://api.whatsapp.com/send?phone=${normalise(phone)}" + if (text.isNotEmpty()) "&text=${Uri.encode(text)}" else "")
    return runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, uri).setPackage("com.whatsapp.w4b")); true }.getOrDefault(false)
}

private fun whenText(iso: String): String {
    if (iso.isEmpty()) return ""
    return runCatching { DateTimeFormatter.ofPattern("d MMM, h:mm a").withZone(IST).format(Instant.parse(iso.replace("+00:00", "Z"))) }.getOrDefault(iso)
}

private fun plusDaysIso(days: Long) = Instant.now().plusSeconds(days * 86_400).toString()

private fun statusLabel(status: String) = when (status) {
    "new", "assigned" -> "New"
    "pending_approval" -> "Awaiting approval"
    "contacted" -> "Contacted"
    "follow_up" -> "Following up"
    "converted" -> "Joined"
    "lost" -> "Closed"
    "rejected" -> "Rejected"
    else -> status.replace("_", " ")
}

// ── Sign in, PIN, switching ─────────────────────────────────────────────────

@Composable private fun LoginScreen(state: AppState) {
    var email by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    val run = rememberRunner(state)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
        if (state.addingAccount) Row(Modifier.fillMaxWidth().padding(8.dp)) { IconButton({ state.addingAccount = false }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } }
        Spacer(Modifier.height(48.dp))
        Image(painterResource(R.drawable.ic_app), null, Modifier.size(72.dp).clip(RoundedCornerShape(20.dp)))
        Text("Chalkboard Leads", color = Ink, fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold, fontSize = 27.sp, modifier = Modifier.padding(top = 20.dp))
        Text("Sign in with your Chalkboard OS account", color = Muted, modifier = Modifier.padding(top = 4.dp, bottom = 24.dp))
        Field("Email", email, KeyboardType.Email) { email = it.trim() }
        Field("Password", pass, KeyboardType.Password, secret = true) { pass = it }
        Spacer(Modifier.height(8.dp))
        Primary("Sign in", enabled = email.isNotEmpty() && pass.isNotEmpty(), busy = run.busy, busyText = "Signing in…") {
            run.run {
                state.profile = null
                state.api.login(email, pass)
                state.signedIn = true
                state.addingAccount = false
                state.screen = Screen.Home
            }
        }
    }
}

@Composable private fun PinSetScreen(state: AppState) {
    var first by remember { mutableStateOf<String?>(null) }
    var pin by remember { mutableStateOf("") }
    val run = rememberRunner(state)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header(if (first == null) "Choose your PIN" else "Enter it once more", "4 digits, private to you. You'll use it to switch to your account on this phone.")
        PinPad(pin, run.busy) { typed ->
            pin = typed
            if (typed.length < 4) return@PinPad
            val chosen = first
            when {
                chosen == null -> { first = typed; pin = "" }
                chosen != typed -> { first = null; pin = ""; state.error = "Those didn't match. Please choose your PIN again." }
                else -> run.run {
                    val r = state.api.post("pin/set", JSONObject().put("new_pin", typed))
                    if (r.optBoolean("ok")) {
                        state.profile?.put("has_pin", true)?.let { state.store.cache("me", it.toString()) }
                        state.needsPin = false
                        state.toast = "PIN saved"
                    } else { first = null; pin = ""; state.error = "Couldn't save your PIN. Please try again." }
                }
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
    val run = rememberRunner(state)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Switch to ${target.name}", "Enter ${target.name}'s PIN", { state.switchTo = null })
        PinPad(pin, run.busy) { typed ->
            pin = typed
            if (typed.length == 4) run.run {
                state.store.activeId = target.id
                try {
                    val r = state.api.post("pin/verify", JSONObject().put("pin", typed))
                    if (r.optBoolean("ok")) {
                        state.api.osUnlock = null
                        state.profile = null
                        state.boot = null
                        state.switchTo = null
                        state.screen = Screen.Home
                    } else {
                        state.store.activeId = previous
                        pin = ""
                        state.error = pinError(r)
                    }
                } catch (e: ApiException) {
                    state.store.activeId = previous
                    pin = ""
                    throw e
                }
            }
        }
    }
}

@Composable private fun AccountsScreen(state: AppState) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Who's using the phone", onBack = { state.back() })
        state.store.accounts().forEach { a ->
            val mine = a.id == state.store.activeId
            Sheet(onClick = if (mine) null else ({ state.switchTo = a })) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Avatar(a.name)
                    Spacer(Modifier.width(12.dp))
                    Text(a.name, color = Ink, fontWeight = FontWeight.Medium, fontSize = 16.sp, modifier = Modifier.weight(1f))
                    if (mine) Pill("Using now", PineSoft, Pine) else Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Muted)
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Secondary("Add a person") { state.addingAccount = true }
        Secondary("Sign ${state.profile?.str("full_name")} out of this phone", Clay) {
            state.store.activeId?.let(state.store::removeAccount)
            state.profile = null
            state.boot = null
            state.api.osUnlock = null
            state.signedIn = state.store.active() != null
            state.screen = Screen.Home
        }
    }
}

// ── Leads ───────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun HomeScreen(state: AppState) {
    val ctx = LocalContext.current
    val owner = state.store.activeId
    var view by remember { mutableStateOf("due") }
    var leads by remember(view, owner) { mutableStateOf(state.store.cached("leads_$view")?.let { JSONArray(it).objects() }) }
    var loading by remember { mutableStateOf(false) }
    var failed by remember { mutableStateOf(false) }
    var again by remember { mutableIntStateOf(0) }
    val listening = remember(state.refresh) { ctx.getSystemService(NotificationManager::class.java).isNotificationListenerAccessGranted(ComponentName(ctx, WhatsAppListener::class.java)) }

    LaunchedEffect(view, state.refresh, owner, again) {
        loading = true
        failed = false
        try {
            val r = state.api.get("leads?view=$view").getJSONArray("leads")
            state.store.cache("leads_$view", r.toString())
            leads = r.objects()
        } catch (e: ApiException) {
            failed = true
            if (leads != null && again > 0) state.error = e.message
        } finally { loading = false }
    }

    val firstName = state.profile?.str("full_name").orEmpty().split(" ").first()
    val dueCount = if (view == "due") leads?.size else null
    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Header(
                if (firstName.isEmpty()) "Leads" else "Hello, $firstName",
                when (dueCount) {
                    null -> "All your open enquiries"
                    0 -> "Nothing needs you right now"
                    1 -> "1 lead needs you"
                    else -> "$dueCount leads need you"
                },
                trailing = { IconButton({ state.screen = Screen.Settings }) { Icon(Icons.Filled.Settings, "Settings", tint = Muted) } },
            )
            if (!listening) Sheet(onClick = { state.screen = Screen.Setup }) {
                Text("New WhatsApp messages won't reach you", color = Clay, fontWeight = FontWeight.Medium)
                Text("Tap to finish phone setup", color = Muted, fontSize = 14.sp)
            }
            Tabs(listOf("due" to "Needs action", "open" to "All open"), view) { view = it }
            Box(Modifier.fillMaxWidth().height(2.dp)) { if (loading && leads != null) LinearProgressIndicator(Modifier.fillMaxWidth().padding(horizontal = 16.dp), color = Pine, trackColor = Color.Transparent) }
            val list = leads
            PullToRefreshBox(loading, { again++ }, Modifier.fillMaxSize()) {
                when {
                    list == null && failed -> Empty(Icons.Filled.Warning, "Couldn't load leads", "Check the internet and try again.", "Try again") { again++ }
                    list == null -> Placeholder()
                    list.isEmpty() -> Empty(Icons.Filled.Check, if (view == "due") "All caught up" else "No open leads yet", "New enquiries will appear here.")
                    else -> LazyColumn(contentPadding = PaddingValues(top = 4.dp, bottom = 96.dp), modifier = Modifier.fillMaxSize()) {
                        items(list, key = { it.getString("id") }) { LeadCard(state, it) }
                    }
                }
            }
        }
        ExtendedFloatingActionButton(
            { state.screen = Screen.NewLead("", "", "") }, Modifier.align(Alignment.BottomEnd).padding(20.dp),
            containerColor = Pine, contentColor = Paper, shape = RoundedCornerShape(18.dp),
        ) {
            Icon(Icons.Filled.Add, null)
            Spacer(Modifier.width(8.dp))
            Text("Add lead", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable private fun LeadCard(state: AppState, l: JSONObject) {
    val reason = state.boot?.optJSONArray("reasons")?.objects()?.firstOrNull { it.str("key") == l.str("contact_reason") }?.str("label")
    val (note, bg, fg) = when {
        l.optBoolean("exhausted") -> Triple("Follow-ups finished: close or keep", HoneySoft, Honey)
        l.str("last_reply_at").isNotEmpty() && l.optInt("follow_up_step") == 0 -> Triple("They replied. Answer them.", ClaySoft, Clay)
        l.optInt("follow_up_step") == 0 -> Triple("First reply not sent", HoneySoft, Honey)
        else -> Triple("Next: " + whenText(l.str("follow_up_at")), PineSoft, Pine)
    }
    Sheet(onClick = { state.screen = Screen.Lead(l) }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Avatar(l.str("full_name"))
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(l.str("full_name"), color = Ink, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(listOfNotNull(reason, statusLabel(l.str("status"))).joinToString(" · "), color = Muted, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Spacer(Modifier.height(10.dp))
        Pill(note, bg, fg)
    }
}

@Composable private fun NewLeadScreen(state: AppState, s: Screen.NewLead) {
    val ctx = LocalContext.current
    var name by remember { mutableStateOf(s.name) }
    var phone by remember { mutableStateOf(s.phone) }
    var reason by remember { mutableStateOf<String?>(null) }
    val run = rememberRunner(state)
    val reasons = state.boot?.optJSONArray("reasons")?.objects().orEmpty().map { it.str("key") to it.str("label") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("New lead", onBack = { state.back() })
        if (s.text.isNotEmpty()) Sheet {
            Text("Their message", color = Muted, fontSize = 13.sp)
            Text("“${s.text}”", color = Ink, modifier = Modifier.padding(top = 4.dp))
        }
        Field("Name", name) { name = it }
        Field("Phone with country code", phone, KeyboardType.Phone) { phone = it }
        if (s.phone.isEmpty() && s.text.isNotEmpty()) {
            Text("We couldn't read this number. Check the chat and type it in.", color = Honey, fontSize = 14.sp, modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp))
        }
        Section("Why are they contacting us?")
        if (reasons.isEmpty()) Placeholder(1) else Chips(reasons, reason, enabled = !run.busy) { reason = it }
        Spacer(Modifier.height(16.dp))
        Primary("Save lead", enabled = name.isNotBlank() && normalise(phone).length >= 10 && reason != null, busy = run.busy) {
            run.run {
                val r = state.api.post("leads", JSONObject().put("full_name", name.trim()).put("phone", normalise(phone)).put("reason", reason)
                    .apply { if (s.text.isNotEmpty()) put("notes", "First message: ${s.text}") })
                s.notif?.let { ctx.getSystemService(NotificationManager::class.java).cancel(it) }
                if (r.optBoolean("duplicate")) state.toast = "This number already has a lead. Opening it." else state.toast = "Lead saved"
                state.screen = Screen.Lead(r.getJSONObject("lead"))
            }
        }
    }
}

@Composable private fun LeadScreen(state: AppState, initial: JSONObject) {
    val ctx = LocalContext.current
    val run = rememberRunner(state)
    var lead by remember(initial) { mutableStateOf(initial) }
    var note by remember { mutableStateOf("") }
    var closing by remember { mutableStateOf(false) }
    var joining by remember { mutableStateOf(false) }
    var reason by remember { mutableStateOf("") }
    val id = lead.getString("id")
    val canManage = state.profile?.optJSONArray("capabilities")?.toString()?.contains("leads.manage") == true
    val isOpen = lead.str("status") !in listOf("converted", "lost", "rejected")
    val templates = state.boot?.optJSONArray("templates")?.objects().orEmpty().filter { it.str("reason_key") == lead.str("contact_reason") }
    val staff = state.boot?.optJSONArray("staff")?.objects().orEmpty()

    fun patch(body: JSONObject, done: String) = run.run {
        lead = state.api.patch("leads/$id", body).getJSONObject("lead")
        state.toast = done
    }
    fun send(text: String, templateId: String?) {
        if (!openWhatsApp(ctx, lead.str("phone"), text)) { state.error = "WhatsApp Business isn't installed."; return }
        state.pending = PendingSend("To ${lead.str("full_name")}. This moves their follow-up schedule on.") {
            val b = JSONObject().put("template_id", templateId ?: JSONObject.NULL)
            lead = state.api.post("leads/$id/sent", b).getJSONObject("lead")
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header(lead.str("full_name"), onBack = { state.back() })
        Box(Modifier.fillMaxWidth().height(2.dp)) { if (run.busy) LinearProgressIndicator(Modifier.fillMaxWidth().padding(horizontal = 16.dp), color = Pine, trackColor = Color.Transparent) }
        Sheet {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Avatar(lead.str("full_name"))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("+" + normalise(lead.str("phone")), color = Ink, fontSize = 16.sp)
                    Spacer(Modifier.height(4.dp))
                    Pill(statusLabel(lead.str("status")), PineSoft, Pine)
                }
            }
            if (lead.str("follow_up_at").isNotEmpty()) Text("Next follow-up: " + whenText(lead.str("follow_up_at")), color = Pine, fontSize = 14.sp, modifier = Modifier.padding(top = 12.dp))
            if (lead.str("notes").isNotEmpty()) Text(lead.str("notes"), color = Muted, fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))
        }
        if (isOpen && canManage) {
            Spacer(Modifier.height(6.dp))
            if (templates.isNotEmpty()) Section("Reply with")
            templates.forEach { t ->
                Sheet(onClick = { send(t.str("body"), t.str("id")) }) {
                    Text(t.str("title"), color = Pine, fontWeight = FontWeight.SemiBold)
                    Text(t.str("body").replace("{name}", lead.str("full_name")), color = Muted, fontSize = 14.sp)
                }
            }
            Primary(if (templates.isEmpty()) "Open chat in WhatsApp" else "Write my own message") { send("", null) }
            Section("Remind me")
            Chips(listOf("1" to "Tomorrow", "3" to "In 3 days", "7" to "In a week"), null, enabled = !run.busy) {
                patch(JSONObject().put("follow_up_at", plusDaysIso(it.toLong())), "Reminder set")
            }
            if (staff.isNotEmpty()) {
                Section("Owner")
                Chips(staff.map { it.str("id") to it.str("full_name") }, lead.str("assigned_to"), enabled = !run.busy) {
                    patch(JSONObject().put("assigned_to", it), "Owner changed")
                }
            }
            Section("Notes")
            Field("Add a note", note) { note = it }
            if (note.isNotBlank()) Secondary("Save note", enabled = !run.busy) {
                patch(JSONObject().put("note", note.trim()), "Note saved")
                note = ""
            }
            Section("Finish")
            Secondary("They joined", enabled = !run.busy) { joining = true }
            Secondary("Close as lost", Clay, enabled = !run.busy) { closing = true }
            Spacer(Modifier.height(16.dp))
        }
    }
    if (joining) {
        AlertDialog(
            onDismissRequest = { joining = false }, containerColor = Sheet, shape = RoundedCornerShape(24.dp),
            title = { Text("Mark as joined?") },
            text = { Text("${lead.str("full_name")} will leave your follow-up list.", color = Muted) },
            confirmButton = { TextButton(onClick = {
                joining = false
                patch(JSONObject().put("status", "converted"), "Marked as joined")
            }) { Text("Yes, joined") } },
            dismissButton = { TextButton(onClick = { joining = false }) { Text("Cancel", color = Muted) } },
        )
    }
    if (closing) {
        AlertDialog(
            onDismissRequest = { closing = false }, containerColor = Sheet, shape = RoundedCornerShape(24.dp),
            title = { Text("Close as lost?") },
            text = { OutlinedTextField(reason, { reason = it }, label = { Text("Reason (optional)") }, shape = RoundedCornerShape(14.dp)) },
            confirmButton = { TextButton(onClick = {
                closing = false
                patch(JSONObject().put("status", "lost").put("lost_reason", reason.trim()), "Lead closed")
            }) { Text("Close lead", color = Clay) } },
            dismissButton = { TextButton(onClick = { closing = false }) { Text("Cancel", color = Muted) } },
        )
    }
}

// ── Settings ────────────────────────────────────────────────────────────────

@Composable private fun SettingsScreen(state: AppState) {
    val run = rememberRunner(state)
    val current = state.boot?.optJSONArray("follow_up_days")?.let { a -> List(a.length()) { a.getInt(it) } }.orEmpty()
    var days by remember(current) { mutableStateOf(current.joinToString(", ")) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Settings", onBack = { state.back() })
        if (state.profile?.optBoolean("os_access") == true) Row2("Chalkboard OS", "Attendance, students, subjects and more", Icons.Filled.Lock) { state.screen = Screen.OsHome }
        Row2("Who's using the phone", state.profile?.str("full_name"), Icons.Filled.Person) { state.screen = Screen.Accounts }
        Row2("Phone setup", "Notifications and battery", Icons.Filled.Notifications) { state.screen = Screen.Setup }
        Section("Follow-up schedule")
        Text("Days after the first reply, for everyone.", color = Muted, fontSize = 14.sp, modifier = Modifier.padding(horizontal = 20.dp))
        Spacer(Modifier.height(6.dp))
        Field("Days, for example 1, 3, 7", days) { days = it }
        Secondary("Save schedule", enabled = !run.busy) {
            val parsed = days.split(",", " ").mapNotNull { it.trim().toIntOrNull() }
            run.run {
                state.api.put("settings/follow-ups", JSONObject().put("days", JSONArray(parsed)))
                val b = state.api.get("bootstrap")
                state.store.cache("boot", b.toString())
                state.boot = b
                state.toast = "Schedule saved"
            }
        }
    }
}

@Composable private fun SetupRow(ok: Boolean, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 5.dp)) {
        Box(Modifier.size(26.dp).clip(CircleShape).background(if (ok) PineSoft else ClaySoft), contentAlignment = Alignment.Center) {
            Icon(if (ok) Icons.Filled.Check else Icons.Filled.Clear, null, tint = if (ok) Pine else Clay, modifier = Modifier.size(16.dp))
        }
        Spacer(Modifier.width(10.dp))
        Text(text, color = Ink)
    }
}

@Composable private fun SetupScreen(state: AppState) {
    val ctx = LocalContext.current
    var tick by remember { mutableIntStateOf(0) }
    LifecycleResumeEffect(Unit) { tick++; onPauseOrDispose {} }
    val listening = remember(tick) { ctx.getSystemService(NotificationManager::class.java).isNotificationListenerAccessGranted(ComponentName(ctx, WhatsAppListener::class.java)) }
    val unrestricted = remember(tick) { ctx.getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(ctx.packageName) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Phone setup", onBack = { state.back() })
        Sheet {
            SetupRow(listening, "Reads WhatsApp notifications")
            SetupRow(unrestricted, "Battery unrestricted")
            val heard = state.store.lastHeard
            Text("Last WhatsApp notification seen: " + if (heard == 0L) "never" else whenText(Instant.ofEpochMilli(heard).toString()), color = Muted, fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))
        }
        Spacer(Modifier.height(6.dp))
        Secondary("Allow reading notifications") { ctx.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        Secondary("Show lead prompts on screen") {
            ctx.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName))
        }
        Secondary("Battery settings for this app") {
            ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}")))
        }
        Primary("Reconnect to notifications") {
            NotificationListenerService.requestRebind(ComponentName(ctx, WhatsAppListener::class.java))
            state.toast = "Reconnecting"
        }
        Text("WhatsApp notifications must stay on. Muted chats, or chats open on screen, can't be seen by this app.", color = Muted, fontSize = 14.sp, modifier = Modifier.padding(20.dp))
    }
}

// ── Boon's OS section ───────────────────────────────────────────────────────

@Composable private fun OsHomeScreen(state: AppState) {
    val run = rememberRunner(state)
    var pin by remember { mutableStateOf("") }
    var classes by remember { mutableStateOf<List<JSONObject>?>(null) }
    val today = remember { LocalDate.now(IST) }
    var date by remember { mutableStateOf(today) }
    val unlocked = state.api.osUnlock != null

    LaunchedEffect(unlocked, date) {
        if (!unlocked) return@LaunchedEffect
        classes = null
        try { classes = state.api.get("os/classes?date=$date").getJSONArray("classes").objects() }
        catch (e: ApiException) { if (e.code == "os_locked") state.api.osUnlock = null; state.error = e.message; classes = emptyList() }
    }
    if (!unlocked) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
            Header("Chalkboard OS", "Enter your PIN to open", { state.back() })
            PinPad(pin, run.busy) { typed ->
                pin = typed
                if (typed.length == 4) run.run {
                    try {
                        val r = state.api.post("pin/verify", JSONObject().put("pin", typed))
                        if (r.optBoolean("ok")) { state.api.osUnlock = r.getString("token"); state.refresh++ } else state.error = pinError(r)
                    } finally { pin = "" }
                }
            }
        }
        return
    }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Chalkboard OS", onBack = { state.back() })
        Row2("Full Chalkboard OS", "Every page: subjects, fees, reports and more", Icons.Filled.Lock) { state.screen = Screen.FullOs }
        Row2("Add a student", icon = Icons.Filled.Person) { state.screen = Screen.AddStudent }
        Row2("Parent messages to send", icon = Icons.AutoMirrored.Filled.Send) { state.screen = Screen.Queue }
        Section("Attendance")
        Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton({ date = date.minusDays(1) }) { Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, "Previous day", tint = Pine) }
            Text(
                if (date == today) "Today, " + date.format(DateTimeFormatter.ofPattern("d MMM")) else date.format(DateTimeFormatter.ofPattern("EEE, d MMM")),
                color = Ink, fontWeight = FontWeight.Medium, fontSize = 16.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center, modifier = Modifier.weight(1f),
            )
            IconButton({ date = date.plusDays(1) }) { Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, "Next day", tint = Pine) }
        }
        val list = classes
        when {
            list == null -> Placeholder(2)
            list.isEmpty() -> Text("No classes on this day.", color = Muted, modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp))
            else -> list.forEach { c ->
                Row2(c.str("name"), c.str("start_time").take(5) + if (c.str("session_category") == "individual_attention") " · Individual Attention" else "") {
                    state.screen = Screen.Roster(c.getString("id"), date.toString())
                }
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

/**
 * The real OS website, with its own login, so the server applies the same roles and
 * capabilities as on a computer. The phone holds no extra access for it.
 */
@Composable private fun FullOsScreen(state: AppState) {
    var chooser by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    var progress by remember { mutableIntStateOf(0) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { r ->
        chooser?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(r.resultCode, r.data))
        chooser = null
    }
    DisposableEffect(Unit) {
        onDispose {
            CookieManager.getInstance().flush()
            state.osPage = null
        }
    }
    Column(Modifier.fillMaxSize()) {
        Header("Chalkboard OS", onBack = { state.screen = Screen.OsHome })
        Box(Modifier.fillMaxWidth().height(2.dp)) { if (progress in 1..99) LinearProgressIndicator({ progress / 100f }, Modifier.fillMaxWidth(), color = Pine, trackColor = Color.Transparent) }
        AndroidView(modifier = Modifier.fillMaxSize(), factory = { ctx ->
            // A login left here must not carry over to whoever signs in next.
            val cookies = CookieManager.getInstance()
            if (state.store.osWebOwner != state.store.activeId) {
                cookies.removeAllCookies(null)
                state.store.osWebOwner = state.store.activeId
            }
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = false
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        if (request.url.host == OS_HOST) return false
                        // wa.me, stored documents and the like belong in their own apps.
                        runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, request.url)) }
                        return true
                    }
                }
                webChromeClient = object : WebChromeClient() {
                    override fun onProgressChanged(view: WebView, newProgress: Int) { progress = newProgress }
                    override fun onShowFileChooser(view: WebView, callback: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
                        chooser?.onReceiveValue(null)
                        chooser = callback
                        return runCatching { pick.launch(params.createIntent()) }.onFailure {
                            callback.onReceiveValue(null)
                            chooser = null
                        }.isSuccess
                    }
                }
                state.osPage = this
                loadUrl("https://$OS_HOST/admin")
            }
        })
    }
}

@Composable private fun RosterScreen(state: AppState, s: Screen.Roster) {
    val run = rememberRunner(state)
    var data by remember { mutableStateOf<JSONObject?>(null) }
    val marks = remember { mutableStateMapOf<String, String>() }
    var topic by remember { mutableStateOf("") }
    var homework by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    LaunchedEffect(s) {
        try {
            val d = state.api.get("os/classes/${s.classId}/roster?date=${s.date}")
            data = d
            d.getJSONArray("students").objects().forEach { marks[it.getString("id")] = it.str("status") }
            d.optJSONObject("session")?.let { topic = it.str("topic_covered"); homework = it.str("homework_assigned"); notes = it.str("teacher_notes") }
        } catch (e: ApiException) { state.error = e.message; state.back() }
    }
    val d = data ?: return Column(Modifier.fillMaxSize()) {
        Header("Attendance", s.date, { state.back() })
        Placeholder(3)
    }
    val batch = d.getJSONObject("batch")
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header(batch.str("name"), s.date, { state.back() })
        if (batch.str("start_time").isEmpty()) Text("This class has no time set. Add one in the full OS first.", color = Honey, fontSize = 14.sp, modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp))
        d.getJSONArray("students").objects().forEach { st ->
            val id = st.getString("id")
            Sheet {
                Text(st.str("full_name"), color = Ink, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Paper).padding(3.dp)) {
                    listOf("present" to "Present", "absent" to "Absent", "late" to "Late", "excused" to "Excused").forEach { (k, label) ->
                        val on = marks[id] == k
                        Text(
                            label, color = if (on) Paper else Muted, fontSize = 13.sp, fontWeight = FontWeight.Medium,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).background(if (on) (if (k == "absent") Clay else Pine) else Color.Transparent)
                                .clickable(enabled = !run.busy) { marks[id] = k }.padding(vertical = 9.dp),
                        )
                    }
                }
            }
        }
        Section("Class notes")
        Field("Today's topic", topic) { topic = it }
        Field("Homework", homework) { homework = it }
        Field("Teacher notes", notes) { notes = it }
        Spacer(Modifier.height(8.dp))
        Primary("Save attendance", enabled = marks.isNotEmpty() && batch.str("start_time").isNotEmpty(), busy = run.busy) {
            run.run {
                val arr = JSONArray()
                marks.forEach { (k, v) -> arr.put(JSONObject().put("studentId", k).put("status", v)) }
                val r = state.api.post("os/attendance", JSONObject().put("batchId", s.classId).put("sessionDate", s.date)
                    .put("startTime", batch.str("start_time")).put("endTime", batch.str("end_time").ifEmpty { JSONObject.NULL })
                    .put("subjectIds", JSONArray()).put("marks", arr).put("topic", topic).put("homework", homework).put("teacherNotes", notes))
                if (r.optBoolean("ok")) {
                    state.toast = "Attendance saved"
                    state.screen = Screen.Queue
                } else state.error = r.optString("error", "Couldn't save.")
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable private fun AddStudentScreen(state: AppState) {
    val run = rememberRunner(state)
    var name by remember { mutableStateOf("") }
    var grade by remember { mutableStateOf("") }
    var board by remember { mutableStateOf<String?>(null) }
    var parent by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var school by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Header("Add a student", onBack = { state.back() })
        Section("Student")
        Field("Student's name", name) { name = it }
        Field("Grade (1-12)", grade, KeyboardType.Number) { grade = it.filter(Char::isDigit).take(2) }
        Spacer(Modifier.height(6.dp))
        Chips(listOf("cbse" to "CBSE", "icse" to "ICSE", "state_board" to "State board"), board, enabled = !run.busy) { board = it }
        Spacer(Modifier.height(6.dp))
        Field("School (optional)", school) { school = it }
        Section("Parent")
        Field("Parent's name", parent) { parent = it }
        Field("Parent's phone", phone, KeyboardType.Phone) { phone = it }
        Spacer(Modifier.height(8.dp))
        Primary("Save student", enabled = name.length >= 2 && grade.isNotEmpty() && board != null && parent.length >= 2 && normalise(phone).length >= 10, busy = run.busy) {
            run.run {
                state.api.post("os/students", JSONObject().put("full_name", name.trim()).put("grade", grade.toInt()).put("board", board)
                    .put("school_name", school.trim()).put("parent_name", parent.trim()).put("parent_phone", "+" + normalise(phone)))
                state.toast = "Student added"
                state.screen = Screen.OsHome
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable private fun QueueScreen(state: AppState) {
    val ctx = LocalContext.current
    var messages by remember { mutableStateOf<List<JSONObject>?>(null) }
    LaunchedEffect(state.refresh) {
        try { messages = state.api.get("os/queue").getJSONArray("messages").objects() }
        catch (e: ApiException) { state.error = e.message; if (messages == null) messages = emptyList() }
    }
    Column(Modifier.fillMaxSize()) {
        Header("Parent messages", onBack = { state.back() })
        val list = messages
        when {
            list == null -> Placeholder(3)
            list.isEmpty() -> Empty(Icons.Filled.Check, "All sent", "Nothing waiting to go to parents.")
            else -> LazyColumn(Modifier.fillMaxSize()) {
                items(list, key = { it.getString("id") }) { m ->
                    Sheet(onClick = {
                        if (openWhatsApp(ctx, m.str("to_number"), m.str("body"))) {
                            state.pending = PendingSend("To ${m.str("student_name")}'s parent.") { state.api.post("os/queue/${m.getString("id")}/sent") }
                        } else state.error = "WhatsApp Business isn't installed."
                    }) {
                        Text(m.str("student_name"), color = Ink, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                        Text(m.str("body"), color = Muted, fontSize = 14.sp, modifier = Modifier.padding(vertical = 6.dp))
                        Pill("Tap to open in WhatsApp", PineSoft, Pine)
                    }
                }
            }
        }
    }
}
