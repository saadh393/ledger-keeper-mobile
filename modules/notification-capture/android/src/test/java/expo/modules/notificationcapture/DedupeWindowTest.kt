package expo.modules.notificationcapture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class DedupeWindowTest {
  @Test
  fun `a duplicate within 24 hours is rejected`() {
    val seen = DedupeWindow.record(emptyMap(), "a", 0)!!
    assertNull(DedupeWindow.record(seen, "a", 60_000))
  }

  @Test
  fun `entries older than 24 hours expire`() {
    val seen = DedupeWindow.record(emptyMap(), "a", 0)!!
    val later = DedupeWindow.record(seen, "a", DedupeWindow.WINDOW_MS)
    assertEquals(mapOf("a" to DedupeWindow.WINDOW_MS), later)
  }
}
