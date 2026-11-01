package `in`.chalkboard.leads

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.CallLog
import android.provider.ContactsContract
import android.telephony.TelephonyManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

private const val SIX_HOURS = 6 * 3_600_000L
private const val FLASH_CALL_MS = 4_000L

enum class CallKind { OPEN, QUIET, IGNORE }

/**
 * What an incoming number can be, by India's numbering. 140 is promotional and
 * 1600/1601 is bank and service traffic, neither of which is a tuition enquiry.
 * The call itself still rings as normal: this only decides whether to ask.
 */
fun callKind(raw: String): CallKind {
    val digits = raw.filter(Char::isDigit)
    if (raw.startsWith("+") && !raw.startsWith("+91")) return if (digits.length >= 8) CallKind.QUIET else CallKind.IGNORE
    val national = when {
        digits.length == 12 && digits.startsWith("91") -> digits.drop(2)
        digits.length == 11 && digits.startsWith("0") -> digits.drop(1)
        else -> digits
    }
    return when {
        national.length != 10 -> CallKind.IGNORE
        national[0] in '6'..'9' -> CallKind.OPEN
        national[0] == '1' -> CallKind.IGNORE
        else -> CallKind.QUIET
    }
}

/** After a call ends, asks about numbers that could be a new enquiry. */
class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
        val store = Store(context)
        val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
        when (intent.getStringExtra(TelephonyManager.EXTRA_STATE)) {
            TelephonyManager.EXTRA_STATE_RINGING -> if (!number.isNullOrEmpty()) store.startRing(number)
            TelephonyManager.EXTRA_STATE_OFFHOOK -> store.markAnswered()
            TelephonyManager.EXTRA_STATE_IDLE -> {
                val ring = store.takeRing() ?: return
                val rangFor = System.currentTimeMillis() - ring.at
                val done = goAsync()
                CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
                    try { afterCall(context.applicationContext, store, ring, rangFor) } finally { done.finish() }
                }
            }
        }
    }

    private suspend fun afterCall(ctx: Context, store: Store, ring: Ring, rangFor: Long) {
        val kind = callKind(ring.number)
        if (kind == CallKind.IGNORE || store.active() == null) return
        val phone = normalise(ring.number)
        if (store.isDeclined(phone) || isSavedContact(ctx, ring.number)) return
        delay(1_500) // The call log entry is written just after the call ends.
        if (markedSpam(ctx, ring.number)) return
        val found = withTimeoutOrNull(6_000) { runCatching { Api(store).get("leads/lookup?phone=${Uri.encode(phone)}") }.getOrNull() }
        if (found?.optBoolean("known_customer") == true) return
        val lead = found?.optJSONObject("lead")
        if (lead != null && lead.optString("status") != "lost") return
        if (!store.throttle("c_$phone", SIX_HOURS)) return
        val flash = !ring.answered && rangFor < FLASH_CALL_MS
        showLeadPrompt(
            ctx, "", phone,
            if (ring.answered) "You spoke to them. Add them as a lead?" else "Missed call. Is this a new lead?",
            phone, phone.hashCode(), SOURCE_CALL, autoOpen = kind == CallKind.OPEN && !flash,
        )
    }

    private fun isSavedContact(ctx: Context, number: String) = granted(ctx, Manifest.permission.READ_CONTACTS) && runCatching {
        ctx.contentResolver.query(
            Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(number)),
            arrayOf(ContactsContract.PhoneLookup._ID), null, null, null,
        )?.use { it.moveToFirst() } == true
    }.getOrDefault(false)

    /** Xiaomi's own spam columns. Other phones lack them, so a failed read means unmarked. */
    private fun markedSpam(ctx: Context, number: String) = granted(ctx, Manifest.permission.READ_CALL_LOG) && runCatching {
        ctx.contentResolver.query(
            CallLog.Calls.CONTENT_URI, arrayOf("cloud_antispam_type", "firewalltype"),
            "${CallLog.Calls.NUMBER}=?", arrayOf(number), "${CallLog.Calls.DATE} DESC",
        )?.use { c -> c.moveToFirst() && (c.getInt(0) != 0 || c.getInt(1) != 0) } == true
    }.getOrDefault(false)

    private fun granted(ctx: Context, permission: String) = ctx.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
}
