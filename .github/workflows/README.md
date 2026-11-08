# GitHub Actions Workflows

This directory contains the GitHub Actions CI/CD workflows for the Ledger Keeper Mobile project.

## Workflows Overview

| Workflow | File | Triggers | Secrets Required | Purpose |
| --- | --- | --- | --- | --- |
| **CI** | [`ci.yml`](./ci.yml) | `pull_request` to `main`<br>`push` to `main` | None | Consolidated continuous integration: Node 22, pnpm cache, ESLint, TypeScript check, translation key validation, Jest unit tests, and Expo doctor. Cancels superseded in-progress runs automatically. |
| **Compress Images** | [`compress-images.yml`](./compress-images.yml) | `pull_request` (image asset changes) | Default `GITHUB_TOKEN` | Losslessly compresses `.jpg`, `.png`, and `.webp` images in pull requests originating from the repository. |
| **E2E Tests Android (Maestro + Emulator)** | [`e2e-android.yml`](./e2e-android.yml) | `workflow_dispatch` (manual) | None | Builds a staging release APK locally using Gradle and executes Maestro end-to-end flows against an Android emulator on a macOS runner. |
| **E2E Tests Android (EAS Build + Emulator)** | [`e2e-android-eas-build.yml`](./e2e-android-eas-build.yml) | `workflow_dispatch` (manual) | None | Downloads an EAS-built APK by URL and runs Maestro end-to-end test flows against an Android emulator on macOS. |
| **E2E Tests Android (Maestro Cloud)** | [`e2e-android-maestro.yml`](./e2e-android-maestro.yml) | `workflow_dispatch` (manual) | `MAESTRO_CLOUD_API_KEY` | Builds a staging APK and uploads it to Maestro Cloud for remote automated testing across cloud Android devices. |
| **EAS Production Build (Android)** | [`eas-build-prod.yml`](./eas-build-prod.yml) | `workflow_dispatch` (manual) | `EXPO_TOKEN` | Triggers an EAS production Android build (`pnpm build:production:android`). |
| **EAS QA Build (Android)** | [`eas-build-qa.yml`](./eas-build-qa.yml) | `workflow_dispatch` (manual)<br>`release` (published) | `EXPO_TOKEN` | Triggers an EAS staging/preview Android build (`pnpm build:preview:android`). |
| **New App Version** | [`new-app-version.yml`](./new-app-version.yml) | `workflow_dispatch` (manual) | `GH_TOKEN` / `GITHUB_TOKEN` | Increments app version (`patch`, `minor`, `major`), runs prebuild, creates a release tag, and pushes it to GitHub. |
| **New GitHub Release** | [`new-github-release.yml`](./new-github-release.yml) | `push` (tags `*`) | Default `GITHUB_TOKEN` | Automatically generates GitHub release notes when a version tag is pushed. |
| **Stale** | [`stale.yml`](./stale.yml) | Schedule (`0 0 * * *`) | Default `GITHUB_TOKEN` | Flags and closes inactive issues and pull requests after defined inactivity thresholds. |

## CI Details (`ci.yml`)

The primary CI pipeline runs on every pull request targeting `main` and on direct pushes to `main`. It runs the following distinct, individually reported steps:

1. **Checkout**: Checks out the repository commit using `actions/checkout@v4`.
2. **Install PNPM**: Sets up pnpm matching the version defined in `package.json` (`pnpm@10.12.3`) using `pnpm/action-setup@v4`.
3. **Setup Node**: Sets up Node 22 with pnpm caching via `actions/setup-node@v4`.
4. **Install Dependencies**: Runs `pnpm install --frozen-lockfile` to ensure clean dependency reproduction.
5. **Lint**: Runs ESLint via `pnpm run lint`.
6. **Type Check**: Runs TypeScript compiler checks without emission via `pnpm run type-check`.
7. **Lint Translations**: Checks translation key parity between English and Bengali via `pnpm run lint:translations`.
8. **Unit Tests**: Runs Jest test suites via `pnpm run test`.
9. **Expo Doctor**: Verifies SDK dependency compatibility via `pnpm run doctor`.

If any step fails, GitHub displays a red check identifying that specific step. Concurrency cancellation (`cancel-in-progress: true`) ensures previous runs are cancelled when subsequent commits are pushed to the same branch or PR.

## Security & Secrets Policy

Workflows requiring sensitive credentials (`EXPO_TOKEN`, `MAESTRO_CLOUD_API_KEY`, repository write tokens) are strictly isolated from pull request events to prevent secrets exposure or unauthorized usage from untrusted pull requests or fork repositories. They execute exclusively through manual invocation (`workflow_dispatch`) or trusted tag releases.
