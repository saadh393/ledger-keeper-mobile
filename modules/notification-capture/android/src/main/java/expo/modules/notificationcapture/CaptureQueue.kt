package expo.modules.notificationcapture

data class QueuedCapture(
  val id: String,
  val packageName: String,
  val title: String,
  val text: String,
  val postedAt: Long,
)

object CaptureQueue {
  const val MAX_ITEMS = 500
  const val MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000L

  fun prune(items: List<QueuedCapture>, now: Long): List<QueuedCapture> = items.filter { now - it.postedAt < MAX_AGE_MS }

  fun enqueue(items: List<QueuedCapture>, item: QueuedCapture, now: Long): List<QueuedCapture> {
    val fresh = prune(items, now)
    if (fresh.any { it.id == item.id }) return fresh
    return (fresh + item).takeLast(MAX_ITEMS)
  }
}
