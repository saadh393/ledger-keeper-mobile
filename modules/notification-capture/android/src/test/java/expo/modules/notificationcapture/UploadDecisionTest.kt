package expo.modules.notificationcapture

import org.junit.Assert.assertEquals
import org.junit.Test

class UploadDecisionTest {
  @Test
  fun `2xx deletes the item`() {
    assertEquals(UploadOutcome.DELETE, UploadDecision.of(201))
    assertEquals(UploadOutcome.DELETE, UploadDecision.of(200))
  }

  @Test
  fun `offline and server errors keep the item for retry`() {
    assertEquals(UploadOutcome.RETRY, UploadDecision.of(null))
    assertEquals(UploadOutcome.RETRY, UploadDecision.of(500))
    assertEquals(UploadOutcome.RETRY, UploadDecision.of(503))
    assertEquals(UploadOutcome.RETRY, UploadDecision.of(429))
    assertEquals(UploadOutcome.RETRY, UploadDecision.of(402))
  }

  @Test
  fun `401 stops uploading`() {
    assertEquals(UploadOutcome.STOP, UploadDecision.of(401))
  }

  @Test
  fun `validation errors drop the item`() {
    assertEquals(UploadOutcome.DROP, UploadDecision.of(422))
    assertEquals(UploadOutcome.DROP, UploadDecision.of(400))
    assertEquals(UploadOutcome.DROP, UploadDecision.of(404))
  }
}
