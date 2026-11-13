# notification-capture

Local Expo module (Android only) that powers auto-capture (`_docs/plan.md` §4).

- `CaptureListenerService` — `NotificationListenerService`, declared by `app.plugin.js` with `BIND_NOTIFICATION_LISTENER_SERVICE`.
- `CaptureFilter` — pure rules (enabled flag → allowlist → summaries/ongoing/hidden → one-time codes → transaction-like). Dropped notifications are never stored or logged.
- `CaptureStore` — enabled flag and allowlist in plain preferences (readable without JavaScript); dedupe hashes, the queue, and the bearer token in `EncryptedSharedPreferences` (Android Keystore master key).
- `CaptureUploadWorker` — WorkManager one-time work with a network constraint, scheduled on every capture and when the app opens; `POST {baseUrl}/books/{bookId}/captures` with `Idempotency-Key` = capture hash.

JavaScript API: `src/features/auto-capture/native/notification-capture.ts`.

## Testing notes

- Android 13+ "restricted settings" can block notification access for apps installed outside Google Play. Testers should install from Play internal testing, or open App info → ⋮ → Allow restricted settings.
- Some OEMs (Xiaomi, Oppo, Vivo, some Samsung builds) stop listeners in the background. Turn off battery optimisation for Ledger Keeper.
- Never log notification content, even in debug builds.

## Unit tests

```bash
cd android && ./gradlew :notification-capture:testDebugUnitTest
```
