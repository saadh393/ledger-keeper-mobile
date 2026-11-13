package expo.modules.notificationcapture

enum class UploadOutcome { DELETE, RETRY, STOP, DROP }

object UploadDecision {
  fun of(status: Int?): UploadOutcome = when {
    status == null -> UploadOutcome.RETRY
    status in 200..299 -> UploadOutcome.DELETE
    status == 401 -> UploadOutcome.STOP
    status == 402 || status == 408 || status == 429 -> UploadOutcome.RETRY
    status in 400..499 -> UploadOutcome.DROP
    else -> UploadOutcome.RETRY
  }
}
