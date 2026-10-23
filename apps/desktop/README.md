# Chrome UI Gallery Desktop

Electron + React desktop gallery and optional Chrome extension manager. Its glass-style interface matches the website and all source files are public.

## Clone and launch

Requires [Git](https://git-scm.com/downloads), [Node.js 22+](https://nodejs.org/) and npm. **Run the full sequence in PowerShell, Terminal or Command Prompt:**

```bash
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
cd apps/desktop
npm install
npm run dev
```

If you already downloaded or cloned the repository, start the commands from the actual `chrome-ui-gallery` directory and use `cd apps/desktop` before `npm install`.

## One-action preparation for Chrome extensions

Open a project card and choose **Prepare for Chrome**. The desktop app downloads its published ZIP archive from the project's GitHub Pages gallery, checks the archive structure and Manifest V3, extracts it to a dedicated directory and opens that directory alongside Chrome's extension manager.

**Chrome still requires an explicit user installation step:** enable Developer mode in `chrome://extensions`, click **Load unpacked**, and select the extracted folder. Chrome does not provide a supported API for a third-party desktop app to silently install unpacked extensions into your existing Chrome profile. The app will never silently modify a Chrome profile.

For toggling an installed extension on or off from the desktop app, first load the optional [Chrome Companion](../../browser-bridge/manager-extension/README.md) in Chrome and pair it using the one-time code in Desktop Settings. The desktop application then displays actual installed extensions and provides toggles for extensions Chrome allows the companion to manage. Some actions can require Chrome confirmation and may be rejected.

## Desktop builds

```bash
npm run build
npm run dist:win
```

On macOS use `npm run dist:mac`. For signing and automatic release updates, see [RELEASING.md](./RELEASING.md). Source builds do not auto-update; update support requires published compatible signed installers.

## Files

- [React UI](./src/App.jsx)
- [App styles](./src/styles.css)
- [Electron main process](./electron/main.cjs)
- [Safe extension ZIP preparation](./electron/install.cjs)
- [Chrome companion](../../browser-bridge/manager-extension/README.md)
