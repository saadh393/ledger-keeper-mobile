package expo.modules.notificationcapture

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import org.json.JSONArray
import org.json.JSONObject

class CaptureStore(context: Context) {
  private val settings: SharedPreferences = context.getSharedPreferences(SETTINGS, Context.MODE_PRIVATE)
  private val secure: SharedPreferences = EncryptedSharedPreferences.create(
    SECURE,
    MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
  )

  fun isEnabled(): Boolean = settings.getBoolean(KEY_ENABLED, false)

  fun setEnabled(enabled: Boolean) = settings.edit().putBoolean(KEY_ENABLED, enabled).apply()

  fun allowedPackages(): Set<String> = settings.getStringSet(KEY_ALLOWED, emptySet()) ?: emptySet()

  fun setAllowedPackages(packages: List<String>) = settings.edit().putStringSet(KEY_ALLOWED, packages.toSet()).apply()

  @Synchronized
  fun markSeen(id: String, now: Long): Boolean {
    val seen = JSONObject(secure.getString(KEY_SEEN, "{}") ?: "{}")
    val map = seen.keys().asSequence().associateWith { seen.getLong(it) }
    val next = DedupeWindow.record(map, id, now) ?: return false
    secure.edit().putString(KEY_SEEN, JSONObject(next as Map<*, *>).toString()).apply()
    return true
  }

  @Synchronized
  fun queue(now: Long): List<QueuedCapture> = CaptureQueue.prune(readQueue(), now)

  @Synchronized
  fun enqueue(item: QueuedCapture, now: Long) = writeQueue(CaptureQueue.enqueue(readQueue(), item, now))

  @Synchronized
  fun remove(ids: Set<String>) = writeQueue(readQueue().filterNot { it.id in ids })

  @Synchronized
  fun clearQueue() = secure.edit().remove(KEY_QUEUE).remove(KEY_SEEN).apply()

  fun auth(): CaptureAuth? {
    val token = secure.getString(KEY_TOKEN, null) ?: return null
    val baseUrl = secure.getString(KEY_BASE_URL, null) ?: return null
    val bookId = secure.getString(KEY_BOOK_ID, null) ?: return null
    return CaptureAuth(token, baseUrl, bookId)
  }

  fun setAuth(auth: CaptureAuth) = secure.edit()
    .putString(KEY_TOKEN, auth.token)
    .putString(KEY_BASE_URL, auth.baseUrl)
    .putString(KEY_BOOK_ID, auth.bookId)
    .apply()

  fun clearAuth() = secure.edit().remove(KEY_TOKEN).remove(KEY_BASE_URL).remove(KEY_BOOK_ID).apply()

  private fun readQueue(): List<QueuedCapture> {
    val array = JSONArray(secure.getString(KEY_QUEUE, "[]") ?: "[]")
    return (0 until array.length()).map { index ->
      val item = array.getJSONObject(index)
      QueuedCapture(item.getString("id"), item.getString("packageName"), item.getString("title"), item.getString("text"), item.getLong("postedAt"))
    }
  }

  private fun writeQueue(items: List<QueuedCapture>) {
    val array = JSONArray()
    items.forEach { array.put(it.toJson()) }
    secure.edit().putString(KEY_QUEUE, array.toString()).commit()
  }

  companion object {
    private const val SETTINGS = "notification_capture_settings"
    private const val SECURE = "notification_capture_secure"
    private const val KEY_ENABLED = "enabled"
    private const val KEY_ALLOWED = "allowed_packages"
    private const val KEY_SEEN = "seen"
    private const val KEY_QUEUE = "queue"
    private const val KEY_TOKEN = "token"
    private const val KEY_BASE_URL = "base_url"
    private const val KEY_BOOK_ID = "book_id"
  }
}

data class CaptureAuth(val token: String, val baseUrl: String, val bookId: String)

fun QueuedCapture.toJson(): JSONObject = JSONObject()
  .put("id", id)
  .put("packageName", packageName)
  .put("title", title)
  .put("text", text)
  .put("postedAt", postedAt)
