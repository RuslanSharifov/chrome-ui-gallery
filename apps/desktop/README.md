# Chrome UI Gallery — Desktop

Electron + React desktop manager for the public Chrome UI Gallery catalog. Dark glass-inspired interface matching the website. Source code is open; no proprietary backend is needed.

## Features

- Search, filter, inspect and open sources of Chrome UI themes and developer tools.
- Animated detail panels with images and direct links to project documentation.
- Companion Chrome extension pairing for installed-extension status and enable/disable actions while Chrome is running.
- GitHub Releases update checking and installer updates in packaged builds.

## Run locally

Requires Node.js 22+.

```bash
cd apps/desktop
npm install
npm run dev
```

Build: `npm run build`. Package: `npm run dist:win` on Windows or `npm run dist:mac` on macOS. Install the [companion extension](../../browser-bridge/manager-extension/README.md) separately to control Chrome extensions. Without the companion, this app is a read-only gallery.

## Safety and releases

Chrome must be running for live extension management. A pairing code and local access token protect the bridge on `127.0.0.1:41739`. The companion requests Chrome's `management` permission. Review permissions before installing. The companion cannot toggle itself. Desktop updates are available only after signed/published installer releases; development mode does not auto-update. macOS distribution requires code signing and notarization for a smooth installation. No installers are currently published by this source-only commit.

## Files

- [Electron main process](./electron/main.cjs)
- [Local bridge](./electron/bridge.cjs)
- [Secure preload API](./electron/preload.cjs)
- [React interface](./src/App.jsx)
- [Visual styles](./src/styles.css)
