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

## ✍️ Documentation

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)
