# Ledger Keeper Mobile — Remaining Backlog Tasks

> Leftover work from open GitHub issues in `saadh393/ledger-keeper-mobile`, as of 2026-11-13.
> Everything not listed here is implemented and committed on `main`. QA on the S8 is still pending for all of it.

---

## 1. Blocked on backend or a product decision

### [#77 Delete account needs backend DELETE /api/users/me](https://github.com/saadh393/ledger-keeper-mobile/issues/77)
- Mobile side is done. Needs the backend endpoint and a decision on which records are kept (purchase/credit history, audit logs, receipt images).

### [#83 Password reset for Google-only accounts is undefined](https://github.com/saadh393/ledger-keeper-mobile/issues/83)
- Needs a product decision on what the backend returns for a Google-only email, then matching copy (en/bn) and a test.

### [#43 Voice input in the AI bar](https://github.com/saadh393/ledger-keeper-mobile/issues/43)
- A 3-second recording came back as "Couldn't transcribe this note" on the SCV42. Likely the backend dependency "Voice upload accepting AAC/M4A"; confirm with the backend.

---

## 2. Needs the web app

### [#58 Privacy policy and Data safety](https://github.com/saadh393/ledger-keeper-mobile/issues/58)
- Mobile side done: `_docs/data-safety.md` and Privacy policy links (shown once `EXPO_PUBLIC_PRIVACY_POLICY_URL` is set).
- **Left:** publish the privacy policy and the account-deletion page in `frontend/`, then set the URL for production. Resolve the "To verify" list in `_docs/data-safety.md`.

---

## 3. Needs Play Console access or the device

### [#59 Play internal testing release](https://github.com/saadh393/ledger-keeper-mobile/issues/59)
- README "Release (Android)" and `eas.json` submit profile are done.
- **Left:** service account key in EAS, production EAS env vars, first manual `.aab` upload, store listing, Data safety, declarations, in-app products, pre-launch report, smoke test.

### [#57 App icon and splash](https://github.com/saadh393/ledger-keeper-mobile/issues/57)
- Assets and config done (`pnpm brand:assets`).
- **Left:** screenshots on the device of two launcher shapes, the themed icon and the splash.

---

## 4. Housekeeping

- [#81](https://github.com/saadh393/ledger-keeper-mobile/issues/81): `pnpm check-all` passes; ready for QA to close.
- [#42](https://github.com/saadh393/ledger-keeper-mobile/issues/42): older dev builds crash with "Cannot find native module 'ExpoAudio'"; rebuild with `expo run:android`.
- [#36](https://github.com/saadh393/ledger-keeper-mobile/issues/36): re-check on the device the earlier report of a ~173 px content offset after closing from full height.
