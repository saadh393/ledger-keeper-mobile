<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
Ledger Keeper Mobile </h1>

> This Project is based on [Obytes starter](https://starter.obytes.com)

Product plan, design, and the issue workflow live in [`_docs/`](./_docs/README.md).

## Setup notes

- Copy `.env.example` to `.env`. Backend URL: set `EXPO_PUBLIC_API_URL` (default `http://10.0.2.2:4000/api`, which is your machine as seen from the Android emulator).
- EAS: run `eas init` with your Expo account, then set `EXPO_ACCOUNT_OWNER` and `EAS_PROJECT_ID` in your shell or EAS environment. `app.config.ts` reads them; they are empty until then.
- App ids: `com.ledgerkeeper.app` (production), `.preview`, `.development`.

## Requirements

- [React Native dev environment ](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [Cursor](https://www.cursor.com/) or [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

To run the app on ios

```sh
pnpm ios
```

To run the app on Android

```sh
pnpm android
```

## Release (Android)

### Prerequisites

- An Expo account with access to the EAS project, and `eas-cli` logged in (`npx eas login`).
- The Play Console app `com.ledgerkeeper.app` created, with Play App Signing on. The first `.aab` must be uploaded by hand in Play Console; later uploads go through EAS Submit.
- A Google Cloud service account with the "Release manager" role in Play Console. Upload its JSON key to EAS (`npx eas credentials` → Android → Google Service Account). Never commit it.

### Secrets and environment

Set these as EAS environment variables for the `production` environment (not in `.env` files in git):

| Variable | Notes |
|---|---|
| `EXPO_PUBLIC_API_URL` | Production API, must be HTTPS |
| `EXPO_PUBLIC_SENTRY_DSN` | Production Sentry DSN |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Source map upload; the token is a secret |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat public Android key |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Public privacy policy page (#58) |

Production builds have no environment badge on the icon. `versionCode` increases on every build (`appVersionSource: remote`, `autoIncrement`); `version` comes from `package.json`.

### Build and submit

```bash
pnpm build:production:android
```

```bash
pnpm submit:production:android
```

The build is a signed `.aab`; submit uploads the latest build to the internal testing track.

### Promote

In Play Console → Testing → Internal testing, check the pre-launch report, then promote the release to closed testing or production. Store listing, Data safety (`_docs/data-safety.md`), content rating, target audience and financial features declarations must be complete before the first review.

### Regenerate icons and splash

```bash
pnpm brand:assets
```

Edits go in `assets/brand/ledger-mark.svg`; the script writes the launcher, adaptive, themed, splash, Play Store and favicon images.

## Continuous Integration & Workflows

Automated CI/CD workflows are documented in [`.github/workflows/README.md`](./.github/workflows/README.md). Every pull request to `main` and push to `main` runs a consolidated Android-focused CI pipeline with Node 22 and pnpm caching, executing ESLint, TypeScript validation, translation key parity checks, Jest unit tests, and Expo doctor.

## ✍️ Documentation

- [CI/CD Workflows](.github/workflows/README.md)
- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)
