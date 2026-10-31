package `in`.chalkboard.leads

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONObject

class Account(val id: String, val name: String, val access: String, val refresh: String)

/** Sessions live encrypted by the Android Keystore. Declined numbers stay on this phone only. */
class Store(context: Context) {
    private val secure = EncryptedSharedPreferences.create(
        context, "auth",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )
    private val local = context.getSharedPreferences("local", Context.MODE_PRIVATE)

    var activeId: String?
        get() = secure.getString("active", null)
        set(v) = secure.edit().putString("active", v).apply()

    private fun accountsJson() = JSONObject(secure.getString("accounts", "{}")!!)

    fun accounts(): List<Account> {
        val all = accountsJson()
        return all.keys().asSequence().map { id ->
            val a = all.getJSONObject(id)
            Account(id, a.getString("name"), a.getString("access"), a.getString("refresh"))
        }.toList().sortedBy { it.name }
    }

    fun active(): Account? = accounts().firstOrNull { it.id == activeId }

    fun saveAccount(id: String, name: String, session: JSONObject) {
        val all = accountsJson()
        all.put(id, JSONObject().put("name", name)
            .put("access", session.getString("access_token"))
            .put("refresh", session.getString("refresh_token")))
        secure.edit().putString("accounts", all.toString()).apply()
    }

    fun removeAccount(id: String) {
        val all = accountsJson()
        all.remove(id)
        secure.edit().putString("accounts", all.toString()).apply()
        if (activeId == id) activeId = all.keys().asSequence().firstOrNull()
    }

    fun isDeclined(phone: String) = local.getStringSet("declined", emptySet())!!.contains(phone.takeLast(10))
    fun decline(phone: String) {
        val set = local.getStringSet("declined", emptySet())!!.toMutableSet()
        set.add(phone.takeLast(10))
        local.edit().putStringSet("declined", set).apply()
    }

    /** True at most once per [windowMs] for a key, so one chat can't flood the phone. */
    fun throttle(key: String, windowMs: Long): Boolean {
        val now = System.currentTimeMillis()
        if (now - local.getLong("t_$key", 0) < windowMs) return false
        local.edit().putLong("t_$key", now).apply()
        return true
    }

    var lastHeard: Long
        get() = local.getLong("last_heard", 0)
        set(v) = local.edit().putLong("last_heard", v).apply()
}
