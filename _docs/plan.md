# Ledger Keeper Mobile — Product Plan

The mobile app is the main Ledger Keeper product. It brings the web app's ledger-first experience to Android first, then iOS, and adds one mobile-only feature: **automatic transaction capture from notifications**. Current working Scope is Android Only, Don't do anything for IOS

This plan is the source of truth for scope. Every GitHub issue must trace back to a section here. If an issue needs something this plan doesn't cover, the Product Manager updates this plan first. See [teams/README.md](./teams/README.md) for how issues move.

---

## 1. Product summary

| | |
| --- | --- |
| Product | AI-powered income and expense tracker |
| Users | People tracking personal or small-business money, many in Bangladesh (BDT, Bangla and English, bKash/Nagad, bank SMS) |
| Platforms | Android (v1) |
| Modes | **Manual mode** is always free. **AI mode** (natural language, voice, receipts, insights, auto-capture parsing) spends credits |
| Backend | Existing Express API (`ledger-keeper-backend`), Better Auth, PostgreSQL. Mobile uses the same API |
| Design | Same design system as the web app. See [design.md](./design.md) |

### Principles
1. **Ledger first, AI as input.** The home screen is the book's ledger. AI is an always-available input bar, not the app structure.
2. **The server owns the truth.** Balances, credits, and validation happen on the backend. The app never trusts itself for money or credits.
3. **Nothing is saved without the user knowing.** AI and auto-capture produce reviewable cards; destructive actions confirm first.
4. **Privacy by default.** Sensitive features (notification access) are off until the user turns them on after a clear explanation.
5. **Fast on mid-range Android.** Judge performance on a release build on a mid-range phone, not on a simulator.
6. Handle Loading, Error, Failed State Gently

---

## 2. Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 54, React Native 0.81, New Architecture, Hermes |
| Starter | Obytes React Native template v9 |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind / Uniwind (Tailwind classes) with theme tokens from [design.md](./design.md) |
| Server state | TanStack Query |
| Local state | Zustand |
| Forms | TanStack Form + Zod |
| Storage | MMKV (encrypted) for app data; `expo-secure-store` for the auth token |
| Lists | FlashList |
| Animation | Reanimated |
| Charts | react-native-skia or Victory Native (decided in the Ledger issue) |
| Auth | Better Auth via `@better-auth/expo` and the backend's bearer-token plugin |
| Voice | `expo-audio`, recording AAC/M4A |
| Receipts | `expo-image-picker`, `expo-image-manipulator` (crop, rotate, resize to ~1600 px) |
| Payments | Google Play Billing / App Store purchases through RevenueCat |
| Notification capture | Custom Expo native module (Android `NotificationListenerService`) with a config plugin |
| Builds and updates | EAS Build, EAS Submit, EAS Update |
| Testing | Jest + React Native Testing Library (unit), Maestro (end-to-end) |
| Monitoring | Sentry (crashes and performance) |

Rules for engineers are in [teams/software-engineer.md](./teams/software-engineer.md).

---

## 3. Feature scope

### 3.1 Authentication
- Sign in with Google and with email and password, using the same Better Auth server as the web app.
- The session is a bearer token kept in secure storage, refreshed on app start, and cleared on sign-out.
- First sign-in asks for the default currency when the server says `currencyConfirmed: false`.

### 3.2 Books and navigation
- Books own the ledger. A drawer holds the book switcher (new, edit, delete book) and navigation: Ledger, Loans, Installments, Credits, Settings.
- The active book is remembered on the device.

### 3.3 Ledger (manual mode, free)
- Month view: income, expense, net, and average stat tiles, plus the transaction list. Previous month is always allowed; next month is disabled on the current month.
- Search, filter (all, income, expense), and sort.
- Add, edit, and delete transactions manually. Itemised receipt transactions show their items.
- Manage categories.
- Pull to refresh; loading, empty, and error states for every list.

### 3.4 Loans and installments
- Same rules as the web app: loans stay out of income and expense; installment payments are expenses linked to a plan.

### 3.5 Assistant (AI mode)
- An always-visible **AI bar** at the bottom of the ledger: text input, mic, camera.
- Sending opens the **Assistant** screen (a bottom sheet that can expand to full screen) showing the chat with artifact cards: saved transactions, drafts to confirm, clarifications, summaries, charts.
- **Chat history**: list of the book's chats, open, delete, new chat; load earlier messages.
- Uncertain failures (offline, timeout, server error) reload the chat and offer a retry that is never charged twice (same idempotency key).

### 3.6 Voice input
- Hold or tap to record; live timer and waveform; auto-stop at the server's limit. Upload compressed audio.
- The transcript and resulting cards appear in the Assistant.

### 3.7 Receipt scanning
- Camera or gallery; crop and rotate; compress; upload.
- The result is a receipt draft the user reviews and saves (or saves as an installment plan).

### 3.8 Automatic transaction capture (notifications) — see Section 4

### 3.9 Credits and payments
- Balance, history, and usage, same as the web app.
- Buying credit packs uses **Google Play Billing / App Store** through RevenueCat. Store policy forbids selling digital credits through an outside checkout such as Lemon Squeezy inside the app. Lemon Squeezy stays on the web.
- The backend grants credits from a RevenueCat webhook into the same credit ledger.

### 3.10 Settings
- Theme (default dark), default currency, categories, auto-capture (Section 4), sign out.
- **Delete account** inside the app (Google Play requirement).

### 3.11 Out of scope for v1
- Offline manual mode with sync (planned after v1).
- Reading SMS directly (`READ_SMS`) and reading mailboxes through the Gmail API (reasons in Section 4.3).
- Widgets, wearables, and tablet-specific layouts.

---

## 4. Automatic transaction capture

### 4.1 What it does
When enabled, the app watches notifications from apps the user picks (bank apps, bKash/Nagad, PayPal, the SMS app, the email app). When a notification looks like a payment or a deposit, the app extracts the amount, direction (income or expense), merchant, and time, and adds it to a **Detected transactions** inbox for one-tap confirmation. Confirmed items become normal ledger transactions with source `notification`.

### 4.2 How it works

```
Notification posted on the phone
   │
   ▼
Android NotificationListenerService (our native module)
   │  1. Is the source app on the user's allowlist?          no → ignore, never stored
   │  2. Does the text look like a transaction?               no → ignore, never stored
   │     (amount + currency + debit/credit words, English and Bangla)
   │  3. Is it a one-time code (OTP, "verification code")?    yes → ignore, never stored
   │  4. Already seen? (hash of app + text + minute)          yes → ignore
   ▼
Encrypted local queue on the device
   │  uploaded when online (app open, or a periodic background task)
   ▼
POST /api/books/:bookId/captures  (backend, new)
   │  rule parser for known senders first (free)
   │  AI parser as fallback (spends credits; see 4.6)
   │  duplicate check: same amount, ±10 min, similar merchant across SMS, app, and email
   ▼
"Detected transactions" inbox in the app → Confirm / Edit / Discard
```

- **SMS** is covered because bank SMS shows up as a notification from the SMS app. No SMS permission is needed.
- **Email** is covered the same way, through notifications from the Gmail or Outlook app.
- Only notifications that arrive **while the feature is on** are seen. Nothing from before is read.
- Some apps hide notification content on the lock screen or truncate it. Those notifications may be missed; the inbox explains this.

### 4.3 Why not read SMS or the mailbox directly
- **`READ_SMS`** is a restricted permission on Google Play. Only default SMS apps or approved exceptions may use it. Requesting it would likely get the app rejected.
- **Gmail API** read access is a restricted Google scope that needs a paid annual security assessment. Not worth it for v1.
- **iOS** does not let apps read other apps' notifications or SMS at all. For iOS (and as an option on Android), v1.1 adds **email forwarding**: each user gets a private forwarding address, sets a mail rule to forward bank emails to it, and the backend parses those emails into the same inbox.

### 4.4 Permission and consent flow (explicit opt-in)
1. **Settings → Auto-capture** is off by default.
2. Turning it on first shows an **explanation screen** (the "prominent disclosure" Google Play requires) covering:
   - **Why:** to add bank and wallet payments to your ledger automatically.
   - **What is read:** notifications from the apps you choose, only while this is on.
   - **What is never read or sent:** notifications from other apps, one-time codes, anything before you turned this on.
   - **Where it goes:** only transaction-like text from chosen apps is sent to Ledger Keeper's server to be parsed, then shown to you to confirm.
   - **How to stop:** turn it off here at any time, or revoke notification access in Android settings.
   - Buttons: **Continue** and **Not now**.
3. **Continue** opens Android's *Notification access* system screen. The app cannot grant this itself.
4. Back in the app, the user picks source apps from a list of installed apps (bank, wallet, SMS and email apps are suggested first).
5. Status shows **On** with the chosen apps and a count of captured items.

**Turning it off** (from the same screen) stops processing immediately: the native service checks the flag before doing anything. The user is offered **Also delete pending detected items**. If Android access is revoked outside the app, the screen shows **Off — access was removed** with a button to re-enable.

### 4.5 Privacy and security rules
- Raw notifications are never logged, never sent to analytics, and never stored outside the encrypted local queue.
- The server stores only the extracted fields plus the source text needed for the user to review; the text is deleted after the item is confirmed or discarded (exact retention is decided in the issue).
- The privacy policy and the Play **Data safety** form are updated before release.
- Ownership is checked server-side like every other endpoint; a capture can only land in the user's own book.

### 4.6 Open decisions (Product Manager decides in the issue)
- Does AI parsing of a capture spend credits, and how many? (Rule-parsed captures are free.)
- Default for confirmed captures: always ask (recommended for v1) or auto-save with undo.
- Which book receives captures when the user has several (default book, or chosen per source app).
- Retention period for source text on the server.

### 4.7 Acceptance criteria (feature level)
- With the feature off, no notification is read, stored, or sent.
- After enabling, a bKash/bank/SMS/email payment notification from a chosen app appears in Detected transactions within 1 minute while online, with the correct amount, direction, and date.
- One-time-code notifications and notifications from apps not chosen never leave the device.
- The same payment notified by SMS and by the bank app appears once.
- Turning the feature off stops capture immediately; revoking Android access is detected and shown.
- The explanation screen is shown before the system permission screen, every time the feature is turned on from off.

---

## 5. Backend work this plan needs

These are issues in the backend repository, linked from the mobile issues that depend on them.

| Backend change | Needed by |
| --- | --- |
| Manual transaction create/update/delete under `/api/books/:bookId/transactions` | Ledger |
| Voice upload accepting AAC/M4A (not only WAV) | Voice input |
| RevenueCat webhook → credit purchase, same idempotency rules as Lemon Squeezy | Credits and payments |
| `POST /api/books/:bookId/captures`, capture parser, duplicate check, Detected inbox API | Auto-capture |
| Inbound email parsing for forwarding addresses | Auto-capture (iOS, v1.1) |
| Account deletion endpoint | Settings |
| Faster AI routing (Groq/Cerebras for text, direct Gemini for vision/voice) | Assistant, voice, receipts (latency) |

---

## 6. Phases (GitHub issues, in order)

Each phase is one GitHub issue, worked one at a time through the process in [teams/README.md](./teams/README.md). Large issues may be split by the Product Manager into sub-issues during analysis.

| # | Issue | Depends on |
| --- | --- | --- |
| 1 | **Foundation:** design tokens and fonts, theme (dark default), API client with bearer token and typed errors, Sentry, CI checks, remove template examples | — |
| 2 | **Authentication:** Google and email sign-in, secure token storage, currency picker | 1 |
| 3 | **App shell and books:** drawer, book switcher, navigation, empty/error states | 2 |
| 4 | **Ledger (manual mode):** month view, list, search/filter/sort, add/edit/delete, categories | 3, backend manual CRUD |
| 5 | **Loans and installments** | 3 |
| 6 | **Assistant (text):** AI bar, Assistant sheet, artifacts, chat history, drafts and clarifications | 4 |
| 7 | **Voice input** | 6, backend M4A |
| 8 | **Receipt scanning** | 6 |
| 9 | **Credits and payments:** balance, history, RevenueCat purchases | 3, backend RevenueCat |
| 10 | **Settings and account:** theme, currency, delete account | 3, backend deletion |
| 11 | **Auto-capture (Android):** native module, consent flow, allowlist, queue, Detected inbox | 4, backend captures |
| 12 | **Release v1 (Android):** icons and splash, privacy policy, Data safety, Play internal testing, store listing | 1–11 |
| 13 | **iOS v1.1:** iOS build, App Store purchases, email-forwarding capture | 12 |

### Definition of done (every issue)
- All acceptance criteria in the issue pass, checked by the Tester on a release build.
- `pnpm check-all` passes; new logic has unit tests; key flows have Maestro tests.
- Light and dark themes, small and large screens, slow network and offline are handled.
- [design.md](./design.md) consistency checklist is met.
- Docs updated: this plan (if scope changed) and the project README.
