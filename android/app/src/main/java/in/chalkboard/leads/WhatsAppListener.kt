package `in`.chalkboard.leads

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Person
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.ContactsContract
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONObject

private const val WA_BUSINESS = "com.whatsapp.w4b"
private const val SIX_HOURS = 6 * 3_600_000L

const val EXTRA_PROMPT_NAME = "prompt_name"
const val EXTRA_PROMPT_PHONE = "prompt_phone"
const val EXTRA_PROMPT_TEXT = "prompt_text"
const val EXTRA_PROMPT_NOTIF = "prompt_notif"
const val EXTRA_OPEN_DUE = "open_due"

/**
 * Turns WhatsApp Business notifications into "Is this a lead?". The notification's
 * shortcut id looks like a number but is WhatsApp's private id, so it is only ever
 * used to recognise a chat: the phone comes from the title or the contact.
 */
class WhatsAppListener : NotificationListenerService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName != WA_BUSINESS) return
        val n = sbn.notification
        val e = n.extras
        val store = Store(applicationContext)
        store.lastHeard = System.currentTimeMillis()
        if (n.flags and Notification.FLAG_GROUP_SUMMARY != 0) return
        if (e.getBoolean(Notification.EXTRA_IS_GROUP_CONVERSATION)) return
        if (n.actions?.any { it.remoteInputs != null } != true) return
        if (store.active() == null) return

        val title = e.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
        val text = e.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty().take(300)
        val titleIsPhone = title.matches(Regex("^\\+?[0-9 ()-]{10,}$"))
        val phone = if (titleIsPhone) normalise(title) else contactPhone(n)
        val chat = n.shortcutId ?: title

        scope.launch {
            if (phone.isNotEmpty() && store.isDeclined(phone)) return@launch
            val api = Api(store)
            var known: JSONObject? = null
            if (phone.isNotEmpty()) {
                // Offline or failed lookup: prompt anyway. The server drops duplicates.
                known = runCatching { api.get("leads/lookup?phone=${Uri.encode(phone)}").optJSONObject("lead") }.getOrNull()
            }
            if (known != null) {
                val status = known.getString("status")
                if (status != "converted" && status != "lost" && status != "rejected" && store.throttle("r_$chat", 600_000)) {
                    runCatching { api.post("leads/${known.getString("id")}/replied") }
                    notifyReply(known.getString("full_name"), known.getString("id"))
                }
                if (status != "lost") return@launch
            }
            if (store.throttle("p_$chat", SIX_HOURS)) {
                prompt(if (titleIsPhone) "" else title, phone, text, chat.hashCode())
            }
        }
    }

    /** Saved contacts arrive with only a name, plus a link to the phone's contact. */
    private fun contactPhone(n: Notification): String {
        val people = n.extras.getParcelableArrayList<Person>(Notification.EXTRA_PEOPLE_LIST)
        val uri = people?.firstNotNullOfOrNull { it.uri }?.let(Uri::parse) ?: return ""
        return runCatching {
            val found = mutableSetOf<String>()
            contentResolver.query(uri, arrayOf(ContactsContract.Contacts._ID), null, null, null)?.use { c ->
                if (!c.moveToFirst()) return@use
                contentResolver.query(
                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                    arrayOf(ContactsContract.CommonDataKinds.Phone.NUMBER),
                    "${ContactsContract.CommonDataKinds.Phone.CONTACT_ID}=?", arrayOf(c.getString(0)), null,
                )?.use { p -> while (p.moveToNext()) found.add(normalise(p.getString(0))) }
            }
            // Several numbers: leave it blank so a person picks rather than the app guessing.
            found.singleOrNull().orEmpty()
        }.getOrDefault("")
    }

    private fun prompt(name: String, phone: String, text: String, id: Int) {
        val ctx = applicationContext
        channels(ctx)
        val open = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_PROMPT_NAME, name)
            putExtra(EXTRA_PROMPT_PHONE, phone)
            putExtra(EXTRA_PROMPT_TEXT, text)
            putExtra(EXTRA_PROMPT_NOTIF, id)
        }
        val yes = PendingIntent.getActivity(ctx, id, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val no = PendingIntent.getBroadcast(
            ctx, id,
            Intent(ctx, NotLeadReceiver::class.java).putExtra("phone", phone).putExtra("id", id),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val who = name.ifEmpty { phone.ifEmpty { "New chat" } }
        val b = Notification.Builder(ctx, CHANNEL_PROMPT)
            .setSmallIcon(R.drawable.ic_note)
            .setContentTitle("Is $who a lead?")
            .setContentText(text)
            .setContentIntent(yes)
            .setAutoCancel(true)
            .addAction(Notification.Action.Builder(null, "Yes, a lead", yes).build())
        if (phone.isNotEmpty()) b.addAction(Notification.Action.Builder(null, "No", no).build())
        ctx.getSystemService(NotificationManager::class.java).notify(id, b.build())
    }

    private fun notifyReply(name: String, leadId: String) {
        val ctx = applicationContext
        channels(ctx)
        val pi = PendingIntent.getActivity(
            ctx, leadId.hashCode(),
            Intent(ctx, MainActivity::class.java).putExtra(EXTRA_OPEN_DUE, true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        ctx.getSystemService(NotificationManager::class.java).notify(
            leadId.hashCode(),
            Notification.Builder(ctx, CHANNEL_PROMPT).setSmallIcon(R.drawable.ic_note)
                .setContentTitle("$name replied").setContentText("Follow-ups paused. Reply when you can.")
                .setContentIntent(pi).setAutoCancel(true).build(),
        )
    }
}

class NotLeadReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        intent.getStringExtra("phone")?.takeIf { it.isNotEmpty() }?.let { Store(context).decline(it) }
        context.getSystemService(NotificationManager::class.java).cancel(intent.getIntExtra("id", 0))
    }
}

const val CHANNEL_PROMPT = "lead_prompts"
const val CHANNEL_REMINDER = "follow_ups"

fun channels(ctx: Context) {
    val m = ctx.getSystemService(NotificationManager::class.java)
    m.createNotificationChannel(NotificationChannel(CHANNEL_PROMPT, "Lead prompts", NotificationManager.IMPORTANCE_HIGH))
    m.createNotificationChannel(NotificationChannel(CHANNEL_REMINDER, "Follow-up reminders", NotificationManager.IMPORTANCE_DEFAULT))
}

/** Digits with a country code. Bare 10-digit numbers are Indian. */
fun normalise(raw: String): String {
    val digits = raw.filter(Char::isDigit)
    return when {
        digits.length == 10 -> "91$digits"
        digits.length == 11 && digits.startsWith("0") -> "91${digits.drop(1)}"
        else -> digits
    }
}
