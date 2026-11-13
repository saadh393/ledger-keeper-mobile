package expo.modules.notificationcapture

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class CaptureListenerService : NotificationListenerService() {
  override fun onNotificationPosted(notification: StatusBarNotification) {
    val store = CaptureStore(applicationContext)
    val extras = notification.notification.extras
    var body: String? = null
    val decision = CaptureFilter.decide(
      enabled = store.isEnabled(),
      allowedPackages = store.allowedPackages(),
      packageName = notification.packageName,
      isGroupSummary = notification.notification.flags and Notification.FLAG_GROUP_SUMMARY != 0,
      isOngoing = notification.isOngoing,
    ) {
      body = NotificationText.body(extras)
      body?.let { "${NotificationText.title(extras)}\n$it" }
    }
    if (decision != CaptureDecision.ACCEPT) return
    onCaptured(notification.packageName, NotificationText.title(extras), body.orEmpty(), notification.postTime, store)
  }

  private fun onCaptured(packageName: String, title: String, text: String, postedAt: Long, store: CaptureStore) {
    val now = System.currentTimeMillis()
    val id = CaptureHash.of(packageName, "$title\n$text", postedAt)
    if (!store.markSeen(id, now)) return
    store.enqueue(QueuedCapture(id, packageName, title, text, postedAt), now)
    CaptureUploadWorker.schedule(applicationContext)
  }
}
