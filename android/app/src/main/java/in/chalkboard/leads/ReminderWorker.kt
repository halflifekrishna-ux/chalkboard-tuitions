package `in`.chalkboard.leads

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.work.CoroutineWorker
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/** Checks the OS for follow-ups due now, and warns if the listener has gone quiet. */
class ReminderWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val store = Store(applicationContext)
        if (store.active() == null) return Result.success()
        val due = runCatching { Api(store).get("leads?view=due").getJSONArray("leads").length() }.getOrElse { return Result.retry() }
        val m = applicationContext.getSystemService(NotificationManager::class.java)
        channels(applicationContext)
        if (due > 0) {
            val pi = PendingIntent.getActivity(
                applicationContext, 1,
                Intent(applicationContext, MainActivity::class.java).putExtra(EXTRA_OPEN_DUE, true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            m.notify(1, Notification.Builder(applicationContext, CHANNEL_REMINDER).setSmallIcon(R.drawable.ic_note)
                .setContentTitle(if (due == 1) "1 lead needs a follow-up" else "$due leads need a follow-up")
                .setContentText("Tap to open them").setContentIntent(pi).setAutoCancel(true).setOnlyAlertOnce(true).build())
        } else {
            m.cancel(1)
        }
        return Result.success()
    }

    companion object {
        fun schedule(ctx: Context) {
            val work = PeriodicWorkRequestBuilder<ReminderWorker>(30, TimeUnit.MINUTES)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
            WorkManager.getInstance(ctx).enqueueUniquePeriodicWork("follow_ups", ExistingPeriodicWorkPolicy.KEEP, work)
        }
    }
}
