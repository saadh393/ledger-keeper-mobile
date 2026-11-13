package expo.modules.notificationcapture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class CaptureFilterTest {
  private val bkash = "com.bKash.customerapp"
  private val messages = "com.google.android.apps.messaging"
  private val whatsapp = "com.whatsapp"
  private val allowed = setOf(bkash, messages, "com.konasl.nagad", "com.paypal.android.p2pmobile", "com.google.android.gm")

  private fun decide(text: String?, pkg: String = messages, summary: Boolean = false, ongoing: Boolean = false) =
    CaptureFilter.decide(true, allowed, pkg, summary, ongoing) { text }

  private fun accepts(text: String, pkg: String = messages) = assertEquals(text, CaptureDecision.ACCEPT, decide(text, pkg))

  private fun drops(text: String, expected: CaptureDecision, pkg: String = messages) = assertEquals(text, expected, decide(text, pkg))

  @Test
  fun `disabled flag returns before reading anything`() {
    var read = false
    val decision = CaptureFilter.decide(false, allowed, bkash, false, false) { read = true; "Cash In Tk 500" }
    assertEquals(CaptureDecision.DISABLED, decision)
    assertFalse(read)
  }

  @Test
  fun `apps outside the allowlist are dropped before reading`() {
    var read = false
    val decision = CaptureFilter.decide(true, allowed, whatsapp, false, false) { read = true; "send me 500 tk" }
    assertEquals(CaptureDecision.NOT_ALLOWED, decision)
    assertFalse(read)
  }

  @Test
  fun `empty allowlist drops everything`() {
    assertEquals(CaptureDecision.NOT_ALLOWED, CaptureFilter.decide(true, emptySet(), bkash, false, false) { "Cash In Tk 500" })
  }

  @Test
  fun `summaries ongoing and hidden content are dropped`() {
    assertEquals(CaptureDecision.IGNORED_KIND, decide("Payment Tk 500", summary = true))
    assertEquals(CaptureDecision.IGNORED_KIND, decide("Payment Tk 500", ongoing = true))
    assertEquals(CaptureDecision.NO_TEXT, decide(null))
    assertEquals(CaptureDecision.NO_TEXT, decide("   "))
    assertEquals(CaptureDecision.NO_TEXT, decide("Contents hidden"))
  }

  @Test
  fun `bkash and nagad transactions are accepted`() {
    accepts("Cash In Tk 5,000.00 from 01711000000 successful. Fee Tk 0.00. Balance Tk 7,500.50. TrxID BJK7ABC at 12/11/2026 10:00", bkash)
    accepts("You have received Tk 1,500.00 from 01811000000. Ref lunch. Balance Tk 3,000.00. TrxID 9XYZ", bkash)
    accepts("Send Money Tk 800.00 to 01911000000 successful. Fee Tk 5.00. Balance Tk 2,195.00", bkash)
    accepts("Cash Out Tk 2,000.00 to Agent 01611000000 successful. Fee Tk 37.00", bkash)
    accepts("Payment Tk 450.00 to Daraz successful. Balance Tk 1,200.00", bkash)
    accepts("Cash In Tk 1000 received. Balance Tk 1500", "com.konasl.nagad")
    accepts("Money Sent Tk 300 to 01700000000. TxnID 7A8B", "com.konasl.nagad")
    accepts("৳৫০০ ক্যাশ ইন সফল হয়েছে। ব্যালেন্স ৳১,২০০", bkash)
    accepts("আপনার অ্যাকাউন্টে ১,৫০০ টাকা জমা হয়েছে", bkash)
    accepts("৮০০ টাকা প্রেরণ সফল। ফি ৫ টাকা", bkash)
    accepts("২,০০০ টাকা ক্যাশ আউট সম্পন্ন", bkash)
    accepts("বিল পরিশোধ ৳৭৫০ সফল", "com.konasl.nagad")
    accepts("আপনি ৳১০০০ গ্রহণ করেছেন", "com.konasl.nagad")
  }

  @Test
  fun `bank sms and card alerts are accepted`() {
    accepts("Your A/C XXXX1234 has been debited by BDT 2,500.00 on 12-Nov-2026. Avl Bal BDT 15,000.00")
    accepts("Dear Customer, BDT 50,000.00 credited to A/C **5678 on 12/11/2026 by salary. Bal BDT 60,250.75")
    accepts("Fund transfer of BDT 10,000 to A/C 9876 successful")
    accepts("ATM withdrawal of BDT 5000 from card ending 4321 at Gulshan")
    accepts("Purchase of USD 12.99 at NETFLIX.COM with card ending 4321")
    accepts("You spent $45.20 at Starbucks with your card ending 1111")
    accepts("Refund of Tk 300 credited to your card ending 4321")
    accepts("Deposit of BDT 20,000 received in your account")
    accepts("A/C 1234 debited Tk500.00 for POS purchase at Shwapno")
    accepts("উত্তোলন: ৫,০০০ টাকা, এটিএম গুলশান")
    accepts("খরচ ৳১,২৫০ কার্ড ৪৩২১ দিয়ে")
  }

  @Test
  fun `paypal and email notifications are accepted`() {
    accepts("You received a payment of $120.00 USD from John Smith", "com.paypal.android.p2pmobile")
    accepts("You sent $35.00 USD to Jane Doe", "com.paypal.android.p2pmobile")
    accepts("Receipt for your payment\nYou paid $9.99 USD to Spotify", "com.google.android.gm")
  }

  @Test
  fun `one-time codes are dropped even with an amount`() {
    drops("OTP for payment of Tk 500 is 123456. Do not share it.", CaptureDecision.OTP)
    drops("Your one-time password is 482910", CaptureDecision.OTP)
    drops("Your verification code is 1234", CaptureDecision.OTP)
    drops("Security code 5521 for purchase of USD 20", CaptureDecision.OTP)
    drops("Your bKash PIN reset request for Tk 0 payment", CaptureDecision.OTP, bkash)
    drops("Your code is 7788 for transfer of BDT 1000", CaptureDecision.OTP)
    drops("আপনার ওটিপি ৪৫৬৭। ৫০০ টাকা পরিশোধের জন্য", CaptureDecision.OTP)
    drops("যাচাইকরণ কোড ১২৩৪", CaptureDecision.OTP)
    drops("লেনদেনের কোড ৮৮৯৯, ১০০০ টাকা জমা", CaptureDecision.OTP)
  }

  @Test
  fun `balance only promotions and chat are dropped`() {
    drops("Your balance is Tk 5,000", CaptureDecision.NOT_TRANSACTION)
    drops("Avail 20% cashback up to Tk 100 this Eid!", CaptureDecision.NOT_TRANSACTION)
    drops("Get free 1GB data on recharge", CaptureDecision.NOT_TRANSACTION)
    drops("Hey, are we meeting today?", CaptureDecision.NOT_TRANSACTION)
    drops("Payment received", CaptureDecision.NOT_TRANSACTION)
    drops("send me 500 tk", CaptureDecision.NOT_ALLOWED, whatsapp)
  }
}
