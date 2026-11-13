# Ledger Keeper Mobile — Remaining Backlog Tasks

> Leftover work from open GitHub issues in `saadh393/ledger-keeper-mobile`, as of 2026-11-13.
> Everything not listed here is implemented and committed on `main`. QA on the S8 is still pending for all of it.

---

## 1. Engineering left

### [#33 Installments list](https://github.com/saadh393/ledger-keeper-mobile/issues/33) / [#34 Add plans and record installment payments](https://github.com/saadh393/ledger-keeper-mobile/issues/34)
- Implemented in `eabe9c2` (`src/features/installments/`).
- **Left:** render tests for the Add/Edit plan, Record payment, Undo payment and Delete plan sheets (list, tabs, expand, states and the pure rules are already tested).
- **Check:** Undo deletes the payment's transaction via `DELETE /api/books/:bookId/transactions/:txId`; confirm that endpoint is live in production.

### [#58 Privacy policy and Data safety](https://github.com/saadh393/ledger-keeper-mobile/issues/58)
- **Left:** write `_docs/data-safety.md` (each data type: collected, shared, purpose, optional, encrypted in transit, deletable, with a one-line reason).
- **Left:** add privacy policy links to the auth screen, Settings, and the auto-capture consent screen.
- **Blocked on web:** publish the privacy policy and the account-deletion page in `frontend/`.

### [#43 Voice input in the AI bar](https://github.com/saadh393/ledger-keeper-mobile/issues/43)
- Permission notice and "Open settings" fixed in `da4e8f1`; tests added.
- **Left:** a 3-second recording came back as "Couldn't transcribe this note". Likely the backend dependency "Voice upload accepting AAC/M4A"; confirm with the backend before changing the app.

---

## 2. Blocked on backend or a product decision

### [#77 Delete account needs backend DELETE /api/users/me](https://github.com/saadh393/ledger-keeper-mobile/issues/77)
- Mobile side is done. Needs the backend endpoint and a decision on which records are kept (purchase/credit history, audit logs, receipt images).

### [#83 Password reset for Google-only accounts is undefined](https://github.com/saadh393/ledger-keeper-mobile/issues/83)
- Needs a product decision on what the backend returns for a Google-only email, then matching copy (en/bn) and a test.

---

## 3. Release

### [#57 App icon and splash](https://github.com/saadh393/ledger-keeper-mobile/issues/57)
- Needs the Ledger Keeper mark as an SVG source (from `LedgerMark.tsx`), then adaptive + monochrome icons, splash on `#131314`, and env badges only on non-production builds via `app.config.ts`.

### [#59 Play internal testing release](https://github.com/saadh393/ledger-keeper-mobile/issues/59)
- Needs Play Console access, EAS secrets, store listing assets, and every v1 issue done. Add the "Release (Android)" section to `README.md`.

---

## 4. Housekeeping

- Post "implemented in" comments on #33, #34, #36–#43, #76, #78–#82 for this round of work.
- [#81](https://github.com/saadh393/ledger-keeper-mobile/issues/81): `pnpm check-all` passes (156 suites, 1312 tests); ready for QA to close.
- [#42](https://github.com/saadh393/ledger-keeper-mobile/issues/42): older dev builds crash with "Cannot find native module 'ExpoAudio'"; rebuild with `expo run:android` (no code change).
- [#36](https://github.com/saadh393/ledger-keeper-mobile/issues/36): re-check on the device the earlier report of a ~173 px content offset after closing from full height.
