package expo.modules.notificationcapture

import android.app.Notification
import android.os.Bundle

object NotificationText {
  fun title(extras: Bundle): String = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()

  fun body(extras: Bundle): String? {
    val lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)?.joinToString("\n")
    val parts = listOfNotNull(
      extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
      lines,
    ).filter { it.isNotBlank() }
    return parts.joinToString("\n").ifBlank { null }
  }
}
