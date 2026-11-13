# Ledger Keeper Mobile — Remaining Backlog Tasks

> Leftover work from open GitHub issues in `saadh393/ledger-keeper-mobile`, as of 2026-11-13.
> All engineering is committed on `main` in `mobile/`, `backend/` and `frontend/`. What is left is pushing and deploying, owner review, Play Console, and QA on the S8.

---

## 1. Push and deploy (owner approval needed)

Commits made locally, not pushed:

| Repo | Commit | Issue |
|---|---|---|
| `backend` | `dccc8a0` `DELETE /api/users/me`, purchases kept with no user (needs `prisma migrate deploy`) | [#77](https://github.com/saadh393/ledger-keeper-mobile/issues/77) |
| `backend` | `fda00fb` retry a provider once on transient 429/5xx | [#43](https://github.com/saadh393/ledger-keeper-mobile/issues/43) |
| `backend` | `e6a2d94` note: no reset email for Google-only accounts | [#83](https://github.com/saadh393/ledger-keeper-mobile/issues/83) |
| `frontend` | `dc8cbce` public `/privacy` and `/delete-account` pages | [#58](https://github.com/saadh393/ledger-keeper-mobile/issues/58) |
| `mobile` | everything since `352f41a` | all |

After deploy: set `EXPO_PUBLIC_PRIVACY_POLICY_URL` (mobile) and `NEXT_PUBLIC_SUPPORT_EMAIL` (web).

---

## 2. Owner review

- [#58](https://github.com/saadh393/ledger-keeper-mobile/issues/58): the privacy and deletion pages promise email deletion within 30 days and need a support address; confirm both. Resolve the "To verify" list in `_docs/data-safety.md`.
- [#83](https://github.com/saadh393/ledger-keeper-mobile/issues/83): password reset email delivery is still not configured in the backend; when it is, skip users without a password account.

---

## 3. Play Console

- [#59](https://github.com/saadh393/ledger-keeper-mobile/issues/59): service account key in EAS, production EAS env vars, first manual `.aab` upload, store listing, Data safety, declarations, in-app products, pre-launch report, smoke test. Steps are in README "Release (Android)".

---

## 4. QA on the S8 (skipped by request)

- Every issue implemented in this round.
- [#57](https://github.com/saadh393/ledger-keeper-mobile/issues/57): screenshots of two launcher shapes, the themed icon and the splash.
- [#77](https://github.com/saadh393/ledger-keeper-mobile/issues/77): delete a throwaway account end to end after deploy.
- [#81](https://github.com/saadh393/ledger-keeper-mobile/issues/81): `pnpm check-all` passes; ready to close.
- [#42](https://github.com/saadh393/ledger-keeper-mobile/issues/42): older dev builds crash with "Cannot find native module 'ExpoAudio'"; rebuild with `expo run:android`.
- [#36](https://github.com/saadh393/ledger-keeper-mobile/issues/36): re-check the earlier ~173 px content offset after closing from full height.
