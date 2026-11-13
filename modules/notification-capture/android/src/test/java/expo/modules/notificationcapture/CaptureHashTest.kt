package expo.modules.notificationcapture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class CaptureHashTest {
  private val minute = 1_700_000_040_000L

  @Test
  fun `same app text and minute give the same id`() {
    assertEquals(CaptureHash.of("bkash", "Cash In  Tk 500", minute), CaptureHash.of("bkash", "cash in tk 500 ", minute + 10_000))
  }

  @Test
  fun `different minute app or text give different ids`() {
    val id = CaptureHash.of("bkash", "Cash In Tk 500", minute)
    assertNotEquals(id, CaptureHash.of("bkash", "Cash In Tk 500", minute + 60_000))
    assertNotEquals(id, CaptureHash.of("nagad", "Cash In Tk 500", minute))
    assertNotEquals(id, CaptureHash.of("bkash", "Cash In Tk 501", minute))
  }
}
