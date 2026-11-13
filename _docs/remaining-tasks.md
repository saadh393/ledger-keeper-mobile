# Ledger Keeper Mobile — Remaining Backlog Tasks

> Leftover work from open GitHub issues in `saadh393/ledger-keeper-mobile`, as of 2026-11-13.
> All engineering in the mobile app is done and committed on `main`. What is left needs a deploy, the web app, Play Console, or the S8 for QA.

---

## 1. Deploy the backend

### [#77 Delete account](https://github.com/saadh393/ledger-keeper-mobile/issues/77)
- `DELETE /api/users/me` is in the backend repo (commit `dccc8a0`, not pushed). Purchases are kept with no user; everything else is deleted.
- **Left:** push and deploy the backend, run `prisma migrate deploy`, then test end to end on the S8 with a throwaway account.

### [#83 Password reset for Google-only accounts](https://github.com/saadh393/ledger-keeper-mobile/issues/83)
- Decision: same neutral message for every email; the app never mentions Google. Test in `4c90ad8`.
- **Left:** when the backend configures reset email delivery (`sendResetPassword`), skip users without a password account (noted in backend `AGENTS.md`).

### [#43 Voice input in the AI bar](https://github.com/saadh393/ledger-keeper-mobile/issues/43)
- **Left:** a 3-second recording came back as "Couldn't transcribe this note" on the SCV42. Likely the backend dependency "Voice upload accepting AAC/M4A"; confirm with the backend.

---

## 2. Needs the web app

### [#58 Privacy policy and Data safety](https://github.com/saadh393/ledger-keeper-mobile/issues/58)
- Mobile side done: `_docs/data-safety.md` and Privacy policy links (shown once `EXPO_PUBLIC_PRIVACY_POLICY_URL` is set).
- **Left:** publish the privacy policy and the account-deletion page in `frontend/`, set the URL for production, and resolve the "To verify" list in `_docs/data-safety.md`.

---

## 3. Needs Play Console access or the device

### [#59 Play internal testing release](https://github.com/saadh393/ledger-keeper-mobile/issues/59)
- README "Release (Android)" and the `eas.json` submit profile are done.
- **Left:** service account key in EAS, production EAS env vars, first manual `.aab` upload, store listing, Data safety, declarations, in-app products, pre-launch report, smoke test.

### [#57 App icon and splash](https://github.com/saadh393/ledger-keeper-mobile/issues/57)
- Assets and config done (`pnpm brand:assets`).
- **Left:** device screenshots of two launcher shapes, the themed icon and the splash.

---

## 4. QA

- Every issue implemented this round still needs QA on the S8 (skipped by request).
- [#81](https://github.com/saadh393/ledger-keeper-mobile/issues/81): `pnpm check-all` passes; ready for QA to close.
- [#42](https://github.com/saadh393/ledger-keeper-mobile/issues/42): older dev builds crash with "Cannot find native module 'ExpoAudio'"; rebuild with `expo run:android`.
- [#36](https://github.com/saadh393/ledger-keeper-mobile/issues/36): re-check the earlier report of a ~173 px content offset after closing from full height.
