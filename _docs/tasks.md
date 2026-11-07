# Ledger Keeper Mobile — Tasks

Session-sized tasks derived from [plan.md](./plan.md), in build order. Scope is Android only. Each task names the docs it relies on so it can be picked up alone. Every task ends with `pnpm check-all` passing and unit tests for new logic.

---

## 1. Empty project with a passing test
Issue: [#2](https://github.com/saadh393/ledger-keeper-mobile/issues/2)
Goal: Reduce the Obytes template to an empty app shell with one passing test.
Description: Remove the template example features (`feed`, `style-demo`, `onboarding`, example `settings` and `auth` screens) and their routes, translations, and tests. Leave a single placeholder home route and one Jest test that renders it. `pnpm check-all` and the Android dev bundle must succeed.

## 2. Color tokens and light/dark themes
Issue: [#3](https://github.com/saadh393/ledger-keeper-mobile/issues/3)
Goal: Implement the design.md color tokens as theme variables usable from Tailwind classes.
Description: Define the light and dark values from design.md §3 as CSS variables in `global.css` and map them to Tailwind names (`paper-100`, `ink-900`, `accent`, `forest-500`, etc.). Replace template colors so components use tokens only, never raw hex. Add a test that both themes expose every token.

## 3. Fonts and typography
Issue: [#4](https://github.com/saadh393/ledger-keeper-mobile/issues/4)
Goal: Load Manrope and Noto Sans Bengali and expose the design.md type scale.
Description: Replace Inter with Manrope (400–700) and add Noto Sans Bengali, loaded before the splash hides. Add Tailwind text styles for the scale in design.md §4 and a tabular-figures utility for amounts, counts and dates. Font scaling must remain enabled.

## 4. Theme preference (dark by default)
Issue: [#5](https://github.com/saadh393/ledger-keeper-mobile/issues/5)
Goal: Let the app hold an explicit light/dark choice, defaulting to dark, persisted on the device.
Description: Create a Zustand store backed by MMKV that holds the theme choice and applies it at the root, ignoring the system setting. The default on first launch is dark. Unit-test the store's default, change, and rehydration.

## 5. English and Bangla translations
Issue: [#6](https://github.com/saadh393/ledger-keeper-mobile/issues/6)
Goal: Configure i18n for English and Bangla instead of the template's Arabic.
Description: Replace `ar.json` with `bn.json`, remove RTL handling that only Arabic needed, and keep the translation lint working. Default language follows the device, falling back to English. Add a test that both files have the same keys.

## 6. Money and date formatting
Issue: [#7](https://github.com/saadh393/ledger-keeper-mobile/issues/7)
Goal: Provide pure functions for displaying amounts and dates per design.md.
Description: Write `formatAmount` (signed `+` / `−` U+2212, book currency, tabular-ready string) and date helpers that format in Asia/Dhaka (day headers, month labels, relative times). These are used by every list and card. Cover English and Bangla numerals and edge cases (zero, large values, decimals) with unit tests.

## 7. Buttons and text fields
Issue: [#8](https://github.com/saadh393/ledger-keeper-mobile/issues/8)
Goal: Restyle the base Button and Input components to the design.md spec.
Description: Button: pill, height 44 (40 compact), primary/secondary/text variants, disabled and pending ("…" label) states, press scale 0.98. Input: radius 12, `surface-container` fill, focus border, label above, error below. Update the existing component tests.

## 8. Display primitives
Issue: [#9](https://github.com/saadh393/ledger-keeper-mobile/issues/9)
Goal: Add the small shared components used across screens.
Description: Build Tone tile (income, expense, info, warning), Chip, Stat tile, and the Empty/Error state block (tone tile, title, body, one action) from design.md §6, one component per file in `src/components/ui/`. Icons use `lucide-react-native` at 1.75 stroke. Add render tests for each variant.

## 9. Bottom sheet and segmented control
Issue: [#10](https://github.com/saadh393/ledger-keeper-mobile/issues/10)
Goal: Provide the app's standard bottom sheet and segmented control.
Description: Wrap `@gorhom/bottom-sheet` with the design.md spec: top radius 28, grabber, title row with close, scrim, keyboard handling, and full-screen expand option. Build a segmented control with a `paper-200` track and raised active segment. Add tests for open/close and selection.

## 10. API client with bearer token and typed errors
Issue: [#11](https://github.com/saadh393/ledger-keeper-mobile/issues/11)
Goal: Give every feature one typed HTTP client for the Ledger Keeper backend.
Description: Configure the client base URL from `env.ts`, attach the bearer token read from secure storage, and map failures to typed errors (offline, timeout, unauthorized, out of credits, validation, server). Add a Zod helper that validates response shapes at the boundary. Unit-test error mapping and token injection with a mocked transport.

## 11. Offline and network status
Issue: [#12](https://github.com/saadh393/ledger-keeper-mobile/issues/12)
Goal: Make TanStack Query and the UI aware of connectivity.
Description: Wire `@react-native-community/netinfo` into TanStack Query's online manager and app-focus refetch. Show a small offline banner component when the device is offline. Unit-test the banner's visibility logic.

## 12. Sentry monitoring
Issue: [#13](https://github.com/saadh393/ledger-keeper-mobile/issues/13)
Goal: Report crashes and performance to Sentry without leaking personal data.
Description: Add Sentry through its Expo config plugin with the DSN from env, environment and release tags, and navigation tracing. Add a `beforeSend` scrubber that strips tokens, amounts, notification text and request bodies. Unit-test the scrubber.

## 13. CI checks
Issue: [#14](https://github.com/saadh393/ledger-keeper-mobile/issues/14)
Goal: Run lint, type-check, translations and tests on every pull request.
Description: Consolidate the template workflows into one Android-focused workflow that runs `pnpm check-all` and `expo-doctor` on pull requests. Remove iOS and template-specific workflows that do not apply. Confirm it passes on a test PR.

## 14. Secure token storage and auth store
Issue: [#15](https://github.com/saadh393/ledger-keeper-mobile/issues/15)
Goal: Store the session token securely and expose auth state to the app.
Description: Implement token get/set/clear on `expo-secure-store` and a Zustand auth store with `hydrate`, `signIn`, and `signOut` states (idle, signed-in, signed-out). Sign-out clears the token and the query cache. Unit-test transitions with secure store mocked.

## 15. Email sign-in and sign-up
Issue: [#16](https://github.com/saadh393/ledger-keeper-mobile/issues/16)
Goal: Let users sign in or create an account with email and password.
Description: Configure the Better Auth client with `@better-auth/expo` against the backend's bearer plugin. Build the auth screen from design.md §7.1 with a TanStack Form + Zod form that toggles between Sign in and Create account, showing pending and server error states. Unit-test validation and submit handling.

## 16. Google sign-in
Issue: [#17](https://github.com/saadh393/ledger-keeper-mobile/issues/17)
Goal: Let users sign in with their Google account.
Description: Add the Google button to the auth screen using Better Auth's social sign-in flow for Expo, including the deep-link redirect configured via `app.config.ts`. Store the resulting bearer token through the auth store. Handle cancel and error states.

## 17. Session restore and route guard
Issue: [#18](https://github.com/saadh393/ledger-keeper-mobile/issues/18)
Goal: Restore the session on app start and route users to the right place.
Description: On launch, read the token, refresh the session from the backend, and keep the splash up until resolved. Expo Router groups send signed-out users to auth and signed-in users to the app; a 401 from any request signs the user out. Unit-test the guard decision function.

## 18. Default currency picker
Issue: [#19](https://github.com/saadh393/ledger-keeper-mobile/issues/19)
Goal: Ask for the default currency on first sign-in.
Description: When the session reports `currencyConfirmed: false`, show a non-dismissible bottom sheet with a searchable currency list (BDT first) and save the choice to the backend. Afterwards continue to the app. Unit-test the gating condition.

## 19. Navigation drawer
Issue: [#20](https://github.com/saadh393/ledger-keeper-mobile/issues/20)
Goal: Add the app drawer with navigation to every main section.
Description: Build the left drawer from design.md §6 (width 288, logo row, nav rows for Ledger, Loans, Installments, Credits, Settings, profile footer) and empty placeholder screens for each section. The active row uses the `selected` token. Add a test that each row navigates.

## 20. Books data and active book
Issue: [#21](https://github.com/saadh393/ledger-keeper-mobile/issues/21)
Goal: Load the user's books and remember the active one on the device.
Description: Add TanStack Query hooks for listing books and a persisted (MMKV) active-book id that falls back to the first book if the saved one is gone. Every book-scoped query key includes the book id. Unit-test the fallback selection function.

## 21. Book switcher
Issue: [#22](https://github.com/saadh393/ledger-keeper-mobile/issues/22)
Goal: Let users switch books from the drawer.
Description: Show the active book in the drawer with a switcher listing all books; selecting one updates the active book and refetches book-scoped data. Handle loading, error with retry, and the no-books case. Add tests for selection.

## 22. Create, edit and delete books
Issue: [#23](https://github.com/saadh393/ledger-keeper-mobile/issues/23)
Goal: Manage books from the book switcher.
Description: Add bottom-sheet forms (TanStack Form + Zod) to create and rename a book, and a confirmed delete. Invalidate the books query after each mutation and move the active book if the current one is deleted. Test validation and the post-delete selection.

## 23. Ledger month switcher
Issue: [#24](https://github.com/saadh393/ledger-keeper-mobile/issues/24)
Goal: Navigate the ledger by month.
Description: Build the ‹ Month Year › switcher with a "This month" link, where next is disabled on the current month (Asia/Dhaka). Keep the selected month in screen state and expose month start/end for queries. Unit-test the month math as pure functions.

## 24. Ledger stat tiles
Issue: [#25](https://github.com/saadh393/ledger-keeper-mobile/issues/25)
Goal: Show income, expense, net and average for the selected month.
Description: Fetch the month summary from the backend for the active book and render four stat tiles in a 2 × 2 grid with signed, tabular amounts. Values come from the server only. Handle loading skeletons and errors.

## 25. Transaction list
Issue: [#26](https://github.com/saadh393/ledger-keeper-mobile/issues/26)
Goal: Show the month's transactions in a fast, grouped list.
Description: Render transactions in a FlashList of ledger rows grouped by day, with a footer showing count and totals, pull to refresh, and loading, empty and error states. Rows are memoized. Unit-test the day-grouping function.

## 26. Search, filter and sort
Issue: [#27](https://github.com/saadh393/ledger-keeper-mobile/issues/27)
Goal: Let users narrow and order the ledger list.
Description: Add a search field, All/Income/Expense segmented filter, and a sort menu above the list, passed as query parameters to the transactions endpoint. Debounce search input. Unit-test the parameter building.

## 27. Ledger row details and actions
Issue: [#28](https://github.com/saadh393/ledger-keeper-mobile/issues/28)
Goal: Let users inspect and act on a single transaction.
Description: Tapping a row expands category, note, and receipt items; long-press (450 ms) opens Copy, Edit and Delete. Delete asks for confirmation and invalidates ledger queries. Test expand and the delete confirm path.

## 28. Add and edit transaction
Issue: [#29](https://github.com/saadh393/ledger-keeper-mobile/issues/29)
Goal: Create and edit transactions manually (free mode).
Description: Build a bottom-sheet form (TanStack Form + Zod) with type, amount, date, category, merchant and note, used for both add (floating "Add transaction" pill) and edit. Submit to the backend manual CRUD endpoints and invalidate ledger and summary queries. Unit-test the schema and payload mapping.

## 29. Manage categories
Issue: [#30](https://github.com/saadh393/ledger-keeper-mobile/issues/30)
Goal: Let users add, rename and delete categories.
Description: Add a categories screen reachable from the ledger ⋯ menu and Settings, listing categories by type with create, rename and confirmed delete. Mutations invalidate category queries. Handle empty and error states.

## 30. Loans list
Issue: [#31](https://github.com/saadh393/ledger-keeper-mobile/issues/31)
Goal: Show loans with totals and status tabs.
Description: Build the Loans screen with totals, Open/Settled/All tabs, and an expandable list, following the web app's rules (loans are not income or expense). Include loading, empty and error states. Test tab filtering.

## 31. Add and settle loans
Issue: [#32](https://github.com/saadh393/ledger-keeper-mobile/issues/32)
Goal: Create loans and record settlement.
Description: Add a bottom-sheet form to create or edit a loan and actions to record repayment and mark settled, matching the web app's behaviour. Invalidate loan queries after each change. Unit-test the form schema.

## 32. Installments list
Issue: [#33](https://github.com/saadh393/ledger-keeper-mobile/issues/33)
Goal: Show installment plans with progress.
Description: Build the Installments screen with Active/Completed/All tabs and expandable rows showing plan totals and payments. Include loading, empty and error states. Test tab filtering.

## 33. Add plans and record installment payments
Issue: [#34](https://github.com/saadh393/ledger-keeper-mobile/issues/34)
Goal: Create installment plans and pay installments.
Description: Add forms to create a plan and to record a payment, which the backend saves as an expense linked to the plan. Invalidate installment and ledger queries afterwards. Unit-test the form schemas.

## 34. AI bar
Issue: [#35](https://github.com/saadh393/ledger-keeper-mobile/issues/35)
Goal: Add the always-visible AI input bar to the ledger.
Description: Build the AI bar from design.md §6: camera, multiline input growing to 160, mic, and send, with the credit hint line, pinned above the keyboard and safe area. Sending is a callback; camera and mic are inert in this task. Test input growth and send enable/disable.

## 35. Assistant sheet and thread
Issue: [#36](https://github.com/saadh393/ledger-keeper-mobile/issues/36)
Goal: Show the Assistant sheet with a chat thread.
Description: Open a bottom sheet (60%, expandable to full screen) with header (title, History, New chat, Close), user bubbles, AI text, day dividers, and the empty state from design.md §7.3. Load the current chat's messages from the backend. Test message rendering order and the empty state.

## 36. Send message with idempotent retry
Issue: [#37](https://github.com/saadh393/ledger-keeper-mobile/issues/37)
Goal: Send text to the assistant safely, never charging twice.
Description: Sending from the AI bar posts the message with an `Idempotency-Key`; on offline, timeout or server error the chat reloads and a failure card offers Retry (same key), Buy credits, and Dismiss. Show a pending state while waiting. Unit-test key reuse across retries.

## 37. Saved-transaction and summary cards
Issue: [#38](https://github.com/saadh393/ledger-keeper-mobile/issues/38)
Goal: Render the assistant's saved-transaction and summary artifacts.
Description: Build the artifact card shell (radius 24, tone-tinted border, header, footer) and the saved-transaction and summary variants. Saving a transaction invalidates ledger queries. Validate artifact payloads with Zod and test each variant.

## 38. Draft and clarification cards
Issue: [#39](https://github.com/saadh393/ledger-keeper-mobile/issues/39)
Goal: Let users confirm drafts and answer clarifications in the assistant.
Description: Render draft cards with Save, Edit and Discard, and clarification cards with answer options or free text, posting the result to the backend. Nothing is saved without the user's action. Test each action's request.

## 39. Chart cards
Issue: [#40](https://github.com/saadh393/ledger-keeper-mobile/issues/40)
Goal: Render chart artifacts from the assistant.
Description: Choose between react-native-skia and Victory Native (record the decision in plan.md), then render the backend's chart artifact types with design tokens in both themes. Charts must not block scrolling. Test rendering for each chart type.

## 40. Chat history
Issue: [#41](https://github.com/saadh393/ledger-keeper-mobile/issues/41)
Goal: Browse and manage the book's chats.
Description: Add a history view in the Assistant sheet listing chats (title, last activity, delete with confirm, "Show older chats"), opening a chat, and starting a new one. "Load earlier messages" pages older messages in the thread. Test pagination and delete.

## 41. Audio recording
Issue: [#42](https://github.com/saadh393/ledger-keeper-mobile/issues/42)
Goal: Record voice input as compressed audio.
Description: Build a hook on `expo-audio` that requests microphone permission, records AAC/M4A, exposes elapsed time and level, and auto-stops at the server's limit. Handle permission denied. Unit-test the state machine with the recorder mocked.

## 42. Voice input in the AI bar
Issue: [#43](https://github.com/saadh393/ledger-keeper-mobile/issues/43)
Goal: Send voice messages from the AI bar.
Description: Wire the mic to the recording hook and show the recording state (discard, timer, credit estimate, waveform, send). Upload the M4A file with an idempotency key; the transcript and resulting cards appear in the Assistant. Depends on the backend accepting M4A.

## 43. Receipt capture and editor
Issue: [#44](https://github.com/saadh393/ledger-keeper-mobile/issues/44)
Goal: Capture a receipt image ready for upload.
Description: The camera button opens camera or gallery via `expo-image-picker`, then a full-screen editor with crop, rotate left/right and reset, and resizes to about 1600 px with `expo-image-manipulator`. Handle permission denied and cancel. Unit-test the resize dimension function.

## 44. Receipt upload and draft
Issue: [#45](https://github.com/saadh393/ledger-keeper-mobile/issues/45)
Goal: Turn a receipt image into a reviewable draft.
Description: Upload the processed image with an idempotency key, show "Scanning receipt…" in the Assistant, then a receipt draft card with items, total and tax, plus Save, Save as installment plan, and Discard. Test the card's actions.

## 45. Credits balance and history
Issue: [#46](https://github.com/saadh393/ledger-keeper-mobile/issues/46)
Goal: Show the user's credit balance, history and usage.
Description: Build the Credits screen with balance (e.g. 56 / 500) and paged history and usage lists from the backend, same as the web app. Values come from the server only. Handle loading, empty and error states.

## 46. Buy credits with Google Play
Issue: [#47](https://github.com/saadh393/ledger-keeper-mobile/issues/47)
Goal: Let users buy credit packs through RevenueCat.
Description: Add RevenueCat via its Expo plugin, list packs in a purchase sheet, and complete purchases with Google Play Billing; credits are granted by the backend webhook, so the app refetches the balance after purchase. Handle cancel, pending and failure. Depends on the backend RevenueCat webhook.

## 47. Settings screen
Issue: [#48](https://github.com/saadh393/ledger-keeper-mobile/issues/48)
Goal: Give users their preferences and sign-out in one place.
Description: Build Settings with theme (Light/Dark), default currency (saved to the backend), links to Categories and Auto-capture, and sign out. Each control shows pending and error states. Test theme and sign-out actions.

## 48. Delete account
Issue: [#49](https://github.com/saadh393/ledger-keeper-mobile/issues/49)
Goal: Let users delete their account inside the app.
Description: Add a destructive Delete account action with a double confirmation that calls the backend deletion endpoint, then clears local storage and signs out. Show pending and failure states. Depends on the backend deletion endpoint.

## 49. Notification listener native module
Issue: [#50](https://github.com/saadh393/ledger-keeper-mobile/issues/50)
Goal: Create the Android native module that can receive notifications.
Description: Scaffold an Expo module with a `NotificationListenerService` and a config plugin that declares it in the manifest. Expose `isAccessGranted()` and `openAccessSettings()` to JavaScript. The service does nothing unless an enabled flag is set.

## 50. Native capture filter
Issue: [#51](https://github.com/saadh393/ledger-keeper-mobile/issues/51)
Goal: Keep only transaction-like notifications from allowed apps.
Description: In the native service, check the enabled flag, the app allowlist, transaction patterns (amount, currency, debit/credit words in English and Bangla), one-time-code exclusion, and a hash of app + text + minute for duplicates, per plan.md §4.2. Rejected notifications are never stored or logged. Cover the filter with Kotlin unit tests using sample bKash, Nagad, bank SMS and OTP texts.

## 51. Encrypted capture queue and upload
Issue: [#52](https://github.com/saadh393/ledger-keeper-mobile/issues/52)
Goal: Store accepted captures securely and send them to the backend.
Description: Accepted captures go into an encrypted on-device queue; the app uploads them to `POST /api/books/:bookId/captures` when online on app open and in a periodic background task, removing items only after success. Never log capture text. Depends on the backend captures endpoint.

## 52. Auto-capture consent screen
Issue: [#53](https://github.com/saadh393/ledger-keeper-mobile/issues/53)
Goal: Show the required disclosure before asking for notification access.
Description: Build the explanation screen from plan.md §4.4 and design.md §7.8 (Why, What we read, What we never read or send, How to turn it off) with Continue and Not now. Continue opens Android's Notification access settings. It appears every time the feature is turned on from off.

## 53. Choose source apps
Issue: [#54](https://github.com/saadh393/ledger-keeper-mobile/issues/54)
Goal: Let users pick which apps auto-capture watches.
Description: List installed apps with bank, wallet, SMS and email apps suggested first, with checkboxes saved as the native allowlist. Show it after access is granted and from the Auto-capture settings. Unit-test the suggestion ordering.

## 54. Auto-capture status and turn off
Issue: [#55](https://github.com/saadh393/ledger-keeper-mobile/issues/55)
Goal: Show auto-capture status and let users stop it.
Description: The Auto-capture screen shows On (chosen apps, captured count), Off, or "Off — access was removed" with re-enable. Turn off clears the enabled flag immediately and offers "Also delete pending detected items". Unit-test the status derivation.

## 55. Detected transactions inbox
Issue: [#56](https://github.com/saadh393/ledger-keeper-mobile/issues/56)
Goal: Let users confirm, edit or discard detected transactions.
Description: Add a badge on the Ledger top bar opening the inbox: draft rows (warning tone, "Detected" pill, source app and time, "Possible duplicate" mark) with Confirm, Edit and Discard. Confirmed items become ledger transactions with source `notification`. Depends on the backend Detected inbox API.

## 56. App icon and splash
Issue: [#57](https://github.com/saadh393/ledger-keeper-mobile/issues/57)
Goal: Brand the app for release.
Description: Replace template icons, adaptive icon and splash with Ledger Keeper assets for dark and light, configured through `app.config.ts`. Remove the template's environment badge from production builds. Verify in a preview build.

## 57. Privacy policy and Data safety
Issue: [#58](https://github.com/saadh393/ledger-keeper-mobile/issues/58)
Goal: Prepare the privacy disclosures Google Play requires.
Description: Update the privacy policy for notification capture, audio, images and payments, and draft the Play Data safety answers matching what the app collects and sends. Link the policy from Settings and the auth screen. Record the answers in `_docs/`.

## 58. Play internal testing release
Issue: [#59](https://github.com/saadh393/ledger-keeper-mobile/issues/59)
Goal: Ship v1 to Google Play internal testing.
Description: Configure EAS production build and EAS Submit for Android, prepare the store listing (text and screenshots), and upload to the internal testing track. Document the release steps in the README.
