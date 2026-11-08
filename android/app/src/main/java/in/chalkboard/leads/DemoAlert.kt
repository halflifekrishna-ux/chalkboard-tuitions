package `in`.chalkboard.leads

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.concurrent.TimeUnit

const val CHANNEL_DEMO = "demo_alerts"
const val EXTRA_DEMO_LEAD = "demo_lead"
const val EXTRA_DEMO_PHONE = "demo_phone"
const val EXTRA_DEMO_NAME = "demo_name"
const val EXTRA_DEMO_MESSAGE = "demo_message"
const val EXTRA_DEMO_NOTIF = "demo_notif"
private const val WA_BUSINESS_PKG = "com.whatsapp.w4b"

/** A WhatsApp message that starts with DEMO, in any case. Same rule the server applies. */
val DEMO_REGEX = Regex("^\\s*demo\\b", RegexOption.IGNORE_CASE)

/**
 * Logs the DEMO message as a meta_ad lead with no prompt, then raises the full-screen
 * alert. Returns false when nothing was logged (offline, error) so the caller can fall
 * back to the normal "Is this a lead?" prompt.
 */
suspend fun handleDemoMessage(ctx: Context, api: Api, name: String, phone: String, text: String): Boolean {
    val r = runCatching {
        api.post("leads/demo", JSONObject().put("phone", phone).put("text", text).apply { if (name.isNotEmpty()) put("full_name", name) })
    }.getOrNull() ?: return false
    val lead = r.getJSONObject("lead")
    if (r.optBoolean("alert")) {
        val leadName = lead.optString("full_name").ifEmpty { "+$phone" }
        showDemoAlert(ctx, lead.getString("id"), phone, leadName, r.optString("slots_message"))
        DemoCheckWorker.schedule(ctx, lead.getString("id"))
    }
    return true
}

private fun showDemoAlert(ctx: Context, leadId: String, phone: String, name: String, message: String) {
    val m = ctx.getSystemService(NotificationManager::class.java)
    m.createNotificationChannel(NotificationChannel(CHANNEL_DEMO, "DEMO enquiries", NotificationManager.IMPORTANCE_HIGH))
    val id = leadId.hashCode()
    val open = Intent(ctx, DemoAlertActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        putExtra(EXTRA_DEMO_LEAD, leadId)
        putExtra(EXTRA_DEMO_PHONE, phone)
        putExtra(EXTRA_DEMO_NAME, name)
        putExtra(EXTRA_DEMO_MESSAGE, message)
        putExtra(EXTRA_DEMO_NOTIF, id)
    }
    val pi = PendingIntent.getActivity(ctx, id, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    // The lock screen shows no name or number.
    val hidden = Notification.Builder(ctx, CHANNEL_DEMO).setSmallIcon(R.drawable.ic_note).setColor(BRAND)
        .setContentTitle("New DEMO enquiry").setContentText("Tap to send the demo slots").build()
    m.notify(
        id,
        Notification.Builder(ctx, CHANNEL_DEMO)
            .setSmallIcon(R.drawable.ic_note).setColor(BRAND)
            .setCategory(Notification.CATEGORY_CALL)
            .setContentTitle("DEMO enquiry from $name")
            .setContentText("Tap to send the demo slots")
            .setVisibility(Notification.VISIBILITY_PRIVATE).setPublicVersion(hidden)
            .setOngoing(true)
            .setContentIntent(pi)
            .setFullScreenIntent(pi, true)
            .build(),
    )
}

/**
 * Full-screen over the lock screen. One button opens the WhatsApp Business chat with the
 * slots typed in; a person taps Send in WhatsApp. Nothing is ever sent from here.
 */
class DemoAlertActivity : ComponentActivity() {
    private var opened by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        val leadId = intent.getStringExtra(EXTRA_DEMO_LEAD).orEmpty()
        val phone = intent.getStringExtra(EXTRA_DEMO_PHONE).orEmpty()
        val name = intent.getStringExtra(EXTRA_DEMO_NAME).orEmpty()
        val message = intent.getStringExtra(EXTRA_DEMO_MESSAGE).orEmpty()
        val notif = intent.getIntExtra(EXTRA_DEMO_NOTIF, 0)

        setContent {
            val scope = rememberCoroutineScope()
            var busy by remember { mutableStateOf(false) }
            Column(
                Modifier.fillMaxSize().background(Color(0xFF1F4D3A)).padding(28.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("DEMO enquiry", color = Color(0xFFF4C430), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text(name, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Spacer(Modifier.height(6.dp))
                Text("+$phone", color = Color(0xFFD7E4DC), fontSize = 15.sp)
                Spacer(Modifier.height(32.dp))
                if (!opened) {
                    Button(
                        onClick = { openChat(phone, message); opened = true },
                        modifier = Modifier.fillMaxWidth().height(60.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF4C430), contentColor = Color(0xFF162D24)),
                    ) { Text("Send demo slots", fontSize = 18.sp, fontWeight = FontWeight.Bold) }
                    if (message.isEmpty()) {
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "No demo slots are set in the OS yet, so the chat opens empty.",
                            color = Color(0xFFF4C430), fontSize = 13.sp, textAlign = TextAlign.Center,
                        )
                    }
                    Spacer(Modifier.height(16.dp))
                    OutlinedButton(onClick = { finish() }, modifier = Modifier.fillMaxWidth()) {
                        Text("Later", color = Color.White)
                    }
                } else {
                    Text("Did you tap Send in WhatsApp?", color = Color.White, fontSize = 18.sp, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(20.dp))
                    Button(
                        enabled = !busy,
                        onClick = {
                            busy = true
                            scope.launch {
                                val api = Api(Store(applicationContext))
                                // Both calls are best effort; the OS stops waiting once either lands.
                                runCatching { api.post("leads/$leadId/sent") }
                                runCatching { api.post("leads/$leadId/demo-handled") }
                                getSystemService(NotificationManager::class.java).cancel(notif)
                                finish()
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF4C430), contentColor = Color(0xFF162D24)),
                    ) { Text("Yes, sent", fontSize = 17.sp, fontWeight = FontWeight.Bold) }
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = { openChat(phone, message) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Open the chat again", color = Color.White)
                    }
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(onClick = { finish() }, modifier = Modifier.fillMaxWidth()) {
                        Text("Not yet", color = Color.White)
                    }
                }
            }
        }
    }

    /** wa.me link with the slots as the text. WhatsApp fills the box and waits for a tap on Send. */
    private fun openChat(phone: String, message: String) {
        val url = buildString {
            append("https://wa.me/").append(phone)
            if (message.isNotEmpty()) append("?text=").append(Uri.encode(message))
        }
        val view = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            startActivity(Intent(view).setPackage(WA_BUSINESS_PKG))
        } catch (_: ActivityNotFoundException) {
            runCatching { startActivity(view) }
        }
    }
}

/** Ten minutes after the alert, ask the server whether anyone handled it. The server owns the rule. */
class DemoCheckWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val id = inputData.getString("lead") ?: return Result.success()
        val store = Store(applicationContext)
        if (store.active() == null) return Result.success()
        return runCatching { Api(store).post("leads/$id/demo-check") }.fold({ Result.success() }, { Result.retry() })
    }

    companion object {
        fun schedule(ctx: Context, leadId: String) {
            val work = OneTimeWorkRequestBuilder<DemoCheckWorker>()
                .setInitialDelay(10, TimeUnit.MINUTES)
                .setInputData(Data.Builder().putString("lead", leadId).build())
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(ctx).enqueue(work)
        }
    }
}
