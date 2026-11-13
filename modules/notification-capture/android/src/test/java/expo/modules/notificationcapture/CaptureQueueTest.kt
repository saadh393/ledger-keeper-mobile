package expo.modules.notificationcapture

import org.junit.Assert.assertEquals
import org.junit.Test

class CaptureQueueTest {
  private val now = 10 * CaptureQueue.MAX_AGE_MS

  private fun item(id: String, postedAt: Long = now) = QueuedCapture(id, "bkash", "bKash", "Cash In Tk 500", postedAt)

  @Test
  fun `enqueue appends new items once`() {
    val queue = CaptureQueue.enqueue(CaptureQueue.enqueue(emptyList(), item("a"), now), item("a"), now)
    assertEquals(listOf("a"), queue.map { it.id })
  }

  @Test
  fun `queue is capped at 500 dropping the oldest`() {
    var queue = emptyList<QueuedCapture>()
    repeat(501) { queue = CaptureQueue.enqueue(queue, item("$it"), now) }
    assertEquals(500, queue.size)
    assertEquals("1", queue.first().id)
    assertEquals("500", queue.last().id)
  }

  @Test
  fun `items older than 7 days are deleted`() {
    val queue = listOf(item("old", now - CaptureQueue.MAX_AGE_MS), item("fresh", now - 1000))
    assertEquals(listOf("fresh"), CaptureQueue.prune(queue, now).map { it.id })
  }
}
