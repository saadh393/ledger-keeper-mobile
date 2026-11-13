package expo.modules.notificationcapture

enum class CaptureDecision { ACCEPT, DISABLED, NOT_ALLOWED, IGNORED_KIND, NO_TEXT, OTP, NOT_TRANSACTION }

object CaptureFilter {
  private val otpLatin = Regex("(?i)(?<![a-z])(otp|one[- ]?time|verification code|security code|pin|code is)(?![a-z])")
  private val otpBangla = listOf("ওটিপি", "যাচাইকরণ কোড", "কোড")
  private val currencyLatin = Regex("(?i)(?<![a-z])(tk|bdt|usd)(?![a-z])|\\$|৳")
  private val currencyBangla = listOf("টাকা")
  private val amount = Regex("[0-9০-৯][0-9০-৯,]*(?:\\.[0-9০-৯]+)?")
  private val movementLatin = Regex(
    "(?i)(?<![a-z])(credited|received|deposit|deposited|cash ?in|refund|refunded|debited|paid|payment|purchase|purchased|spent|sent|send money|transfer|transferred|cash ?out|withdraw|withdrawn|withdrawal)(?![a-z])",
  )
  private val movementBangla = listOf("জমা", "গ্রহণ", "প্রাপ্ত", "ক্যাশ ইন", "পরিশোধ", "খরচ", "প্রেরণ", "ক্যাশ আউট", "উত্তোলন")
  private val hiddenContent = Regex("(?i)^contents? hidden$")

  fun decide(
    enabled: Boolean,
    allowedPackages: Set<String>,
    packageName: String,
    isGroupSummary: Boolean,
    isOngoing: Boolean,
    readText: () -> String?,
  ): CaptureDecision {
    if (!enabled) return CaptureDecision.DISABLED
    if (packageName !in allowedPackages) return CaptureDecision.NOT_ALLOWED
    if (isGroupSummary || isOngoing) return CaptureDecision.IGNORED_KIND
    val text = readText()?.trim()
    if (text.isNullOrEmpty() || hiddenContent.matches(text)) return CaptureDecision.NO_TEXT
    if (isOtp(text)) return CaptureDecision.OTP
    if (!isTransactionLike(text)) return CaptureDecision.NOT_TRANSACTION
    return CaptureDecision.ACCEPT
  }

  fun isOtp(text: String): Boolean = otpLatin.containsMatchIn(text) || otpBangla.any { text.contains(it) }

  fun isTransactionLike(text: String): Boolean {
    val hasCurrency = currencyLatin.containsMatchIn(text) || currencyBangla.any { text.contains(it) }
    val hasMovement = movementLatin.containsMatchIn(text) || movementBangla.any { text.contains(it) }
    return hasCurrency && hasMovement && amount.containsMatchIn(text)
  }
}
