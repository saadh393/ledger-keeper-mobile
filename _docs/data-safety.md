# Google Play Data Safety — Answer Sheet

Answers for the Play Console Data safety form (#58), entered as part of #59. Each row names the feature or file that justifies it. Re-check this sheet whenever data handling changes.

## General answers

| Question | Answer | Reason |
|---|---|---|
| Does the app collect or share any of the required user data types? | Yes | Account, ledger, chat, voice, receipt and auto-capture data go to the Ledger Keeper server |
| Is all collected data encrypted in transit? | Yes | `env.ts` rejects non-HTTPS `EXPO_PUBLIC_API_URL` in preview and production; Sentry, RevenueCat and Google Play use HTTPS |
| Can users request that their data be deleted? | Yes | Settings → Delete account (#49, `src/features/settings/components/delete-account-sheet.tsx`); web deletion page from #58. Needs backend `DELETE /api/users/me` (#77) before release |
| Does the app sell data? | No | No ads or data brokers |

## Data types

"Shared" means sent to a third party other than Ledger Keeper's own server and service providers acting for it. Play treats service providers (AI providers, Sentry, RevenueCat) as not shared when they process data only on our behalf; they are listed here so the policy can name them.

| Data type (Play category) | Collected | Shared | Optional | Purpose | Deletable | Reason |
|---|---|---|---|---|---|---|
| Name (Personal info) | Yes | No | Required | Account management | Yes | Sign-up and Google sign-in (`src/features/auth/`) |
| Email address (Personal info) | Yes | No | Required | Account management, password reset | Yes | Email sign-in and reset (#61) |
| User IDs (Personal info) | Yes | No | Required | Account management, purchases | Yes | Server user ID; RevenueCat app user ID (`src/features/credits/api/ensure-purchases-user.ts`) |
| Other financial info (Financial info) | Yes | No | Required | App functionality | Yes | Transactions, books, loans, installments (`src/features/ledger/`, `loans/`, `installments/`) |
| Purchase history (Financial info) | Yes | No | Optional | App functionality (credits) | Purchase records kept as required by law | Credit packs through Google Play and RevenueCat (#47) |
| Other in-app messages (Messages) | Yes | No | Optional | App functionality | Yes | Assistant chat text (#37); processed by AI providers on our behalf |
| Other in-app messages — notification text (Messages) | Yes | No | Optional (off by default) | App functionality (auto-capture) | Yes | Only transaction-like notifications from apps the user chooses; one-time codes filtered on the device (`modules/notification-capture`, #50–#56) |
| Voice or sound recordings (Audio) | Yes | No | Optional | App functionality | Not stored | Voice notes uploaded for transcription (#43); the server keeps the transcript, not the audio. Local file deleted after upload |
| Photos (Photos and videos) | Yes | No | Optional | App functionality | Yes | Receipt images uploaded and stored (#44, #45) |
| App interactions (App activity) | Yes | No | Required | App functionality | Yes | AI credit usage history (#46) |
| Crash logs (App info and performance) | Yes | No | Required | Analytics, stability | Retained by Sentry policy | Sentry; personal and financial content scrubbed (`src/lib/sentry/scrubber.ts`) |
| Diagnostics (App info and performance) | Yes | No | Required | Analytics, stability | Retained by Sentry policy | Sentry performance traces (`src/lib/sentry/`) |
| Installed apps (App info) | No | — | — | — | — | The auto-capture app picker reads launchable apps on the device only (`LaunchableApps.kt`); the list is not sent |
| Location, contacts, calendar, health, web history | No | — | — | — | — | Not used |

## To verify before entering in Play Console

- Backend retention for chat text, receipt images and notification text after review (the policy says source text is deleted after review, `_docs/plan.md` §4.5).
- Which AI providers are configured in production, so the policy names them.
- Whether `DELETE /api/users/me` (#77) is live, and which records it keeps.
