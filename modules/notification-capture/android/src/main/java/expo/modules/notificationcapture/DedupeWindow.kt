package expo.modules.notificationcapture

object DedupeWindow {
  const val WINDOW_MS = 24 * 60 * 60 * 1000L

  fun record(seen: Map<String, Long>, id: String, now: Long): Map<String, Long>? {
    val fresh = seen.filterValues { now - it < WINDOW_MS }
    if (fresh.containsKey(id)) return null
    return fresh + (id to now)
  }
}
