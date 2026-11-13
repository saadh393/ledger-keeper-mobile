package expo.modules.notificationcapture

import java.security.MessageDigest

object CaptureHash {
  fun of(packageName: String, text: String, postedAt: Long): String {
    val normalised = text.lowercase().replace(Regex("\\s+"), " ").trim()
    val input = "$packageName|$normalised|${postedAt / 60_000}"
    return MessageDigest.getInstance("SHA-256").digest(input.toByteArray()).joinToString("") { "%02x".format(it) }
  }
}
