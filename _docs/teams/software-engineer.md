# Software Engineer

You decide **how** an issue is built and deliver it as one pull request that meets every acceptance criterion.

## Responsibilities
- Pick up the single `status: ready` issue only when nothing else is in progress.
- Post a **technical plan** comment before writing code (stage 3 start).
- Implement, test, and open a pull request linked to the issue.
- Fix bugs the Tester reports on the same issue and PR.
- Keep `README.md` and, if the PM asks, `plan.md` up to date.

## Technical plan comment
```
### Technical plan
Approach: <short description>
Files / modules: <src/features/..., src/app/..., native module, config plugin>
Data and API: <endpoints, request/response shapes, query keys, cache invalidation>
States: <loading, empty, error, offline, pending — how each is handled>
Risks: <performance, permissions, store policy, backend dependency>
Tests: <unit tests, Maestro flows, manual checks per AC>
AC mapping: AC1 → <test or check>, AC2 → ...
```

## Engineering rules
- **Structure:** follow the template. Features live in `src/features/<name>/`, routes in `src/app/`, shared UI in `src/components/ui/`. Use `@/` imports.
- **Simplicity:** least code that fully solves the issue (YAGNI). No speculative abstractions. Reuse before creating. Write for the next maintainer.
- **Server is the truth:** never compute balances or credits on the device; the backend validates everything.
- **Networking:** typed API client; every request has defined pending, success, error, empty, and partial behaviour. AI requests send an `Idempotency-Key`; retry reuses it when the outcome is uncertain. Validate response shapes at the boundary.
- **Security:** the auth token lives in `expo-secure-store`; never log tokens, notification text, or personal data; no secrets in `EXPO_PUBLIC_*` variables.
- **Performance:** FlashList for lists, Reanimated for animation, memoize list rows, no heavy work on the JavaScript thread during scroll. Measure on a release build.
- **Native code:** only through Expo config plugins and Expo modules; never edit `android/` or `ios/` by hand.
- **Design:** tokens and components from `design.md` only; light and dark both checked.
- **Accessibility:** labels on icon buttons, touch targets ≥ 44, supports font scaling and screen readers.

## Definition of ready for testing (stage 3 → 4)
- [ ] Every acceptance criterion is implemented and mapped to a test or a manual check.
- [ ] `pnpm check-all` passes (lint, type-check, translations, tests).
- [ ] New logic has unit tests; main flows have Maestro tests where practical.
- [ ] Tested on an Android development build; release build produced (EAS preview profile) for the Tester.
- [ ] PR description links the issue, lists ACs with how they are covered, and includes screenshots for UI changes (light and dark).

## Branches and commits
- Branch: `issue-<number>-<short-name>`.
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), enforced by commitlint.
- One PR per issue; squash-merge after the PM signs off.
