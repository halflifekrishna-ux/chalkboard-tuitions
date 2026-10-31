package `in`.chalkboard.leads

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class ApiException(message: String, val code: String, val status: Int) : Exception(message)

/** The only network code in the app. It knows the OS API and nothing about Supabase. */
class Api(private val store: Store) {
    /** Live token from entering the PIN. Kept in memory only, and it expires on the server. */
    var osUnlock: String? = null

    suspend fun get(path: String) = call("GET", path, null)
    suspend fun post(path: String, body: JSONObject = JSONObject()) = call("POST", path, body)
    suspend fun patch(path: String, body: JSONObject) = call("PATCH", path, body)
    suspend fun put(path: String, body: JSONObject) = call("PUT", path, body)

    suspend fun login(email: String, password: String): JSONObject {
        val r = raw("POST", "auth/login", JSONObject().put("email", email).put("password", password), null)
        val p = r.getJSONObject("profile")
        store.saveAccount(p.getString("id"), p.getString("full_name"), r.getJSONObject("session"))
        store.activeId = p.getString("id")
        return p
    }

    private suspend fun call(method: String, path: String, body: JSONObject?): JSONObject {
        val account = store.active() ?: throw ApiException("Please sign in.", "no_token", 401)
        try {
            return raw(method, path, body, account.access)
        } catch (e: ApiException) {
            if (e.status != 401) throw e
        }
        val fresh = raw("POST", "auth/refresh", JSONObject().put("refresh_token", account.refresh), null)
        store.saveAccount(account.id, account.name, fresh.getJSONObject("session"))
        return raw(method, path, body, store.active()!!.access)
    }

    private suspend fun raw(method: String, path: String, body: JSONObject?, token: String?): JSONObject =
        withContext(Dispatchers.IO) {
            val c = URL("$BASE/$path").openConnection() as HttpURLConnection
            try {
                c.requestMethod = method
                c.connectTimeout = 15_000
                c.readTimeout = 30_000
                c.setRequestProperty("Accept", "application/json")
                token?.let { c.setRequestProperty("Authorization", "Bearer $it") }
                osUnlock?.let { c.setRequestProperty("X-OS-Unlock", it) }
                if (body != null) {
                    c.doOutput = true
                    c.setRequestProperty("Content-Type", "application/json")
                    c.outputStream.use { it.write(body.toString().toByteArray()) }
                }
                val status = c.responseCode
                val text = (if (status < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
                val json = runCatching { JSONObject(text) }.getOrDefault(JSONObject())
                if (status >= 400) {
                    throw ApiException(json.optString("error", "Something went wrong. Please try again."), json.optString("code", "server"), status)
                }
                json
            } catch (e: java.io.IOException) {
                throw ApiException("No connection. Check the internet and try again.", "offline", 0)
            } finally {
                c.disconnect()
            }
        }

    companion object {
        const val BASE = "https://www.chalkboardlearning.in/api/mobile/v1"
    }
}
