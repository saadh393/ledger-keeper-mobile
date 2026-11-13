package expo.modules.notificationcapture

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object CaptureUploader {
  fun upload(auth: CaptureAuth, item: QueuedCapture): Int? = try {
    val connection = URL("${auth.baseUrl.trimEnd('/')}/books/${auth.bookId}/captures").openConnection() as HttpURLConnection
    connection.requestMethod = "POST"
    connection.connectTimeout = 15_000
    connection.readTimeout = 30_000
    connection.doOutput = true
    connection.setRequestProperty("Content-Type", "application/json")
    connection.setRequestProperty("Authorization", "Bearer ${auth.token}")
    connection.setRequestProperty("Idempotency-Key", item.id)
    val body = JSONObject()
      .put("packageName", item.packageName)
      .put("title", item.title)
      .put("text", item.text)
      .put("postedAt", java.time.Instant.ofEpochMilli(item.postedAt).toString())
    connection.outputStream.use { it.write(body.toString().toByteArray()) }
    val status = connection.responseCode
    connection.disconnect()
    status
  } catch (error: Exception) {
    null
  }

  fun isSecure(baseUrl: String): Boolean {
    val url = URL(baseUrl)
    return url.protocol == "https" || url.host in setOf("10.0.2.2", "localhost", "127.0.0.1")
  }
}
