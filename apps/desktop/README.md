# Chrome UI Gallery Desktop

Electron + React desktop gallery and optional Chrome extension manager. Its glass-style interface matches the website and all source files are public.

**[Step-by-step beginner installation tutorial (website)](https://ruslansharifov.github.io/chrome-ui-gallery/desktop.html)** — illustrated Windows ZIP download, extraction, Node.js, launch and Chrome Companion pairing. Source ZIP is not a prebuilt installer.\n\n## Clone and launch

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

## Troubleshooting: Cannot find module 'adm-zip'

If Vite starts but Electron reports `Cannot find module 'adm-zip'`, your local dependencies are out of date. Version 0.1.1 added `adm-zip` to `package.json`; pulling Git changes alone does not update `node_modules`.

On Windows PowerShell, from any directory:

```powershell
cd C:\Users\User\Project\chrome-ui-gallery
git pull origin main
cd apps\desktop
npm install
npm ls adm-zip
npm run dev
```

If `npm ls adm-zip` still shows it missing, run `npm install adm-zip` inside `apps/desktop`. If the dependency installation is corrupt, close running Electron and Vite processes, remove only `apps/desktop/node_modules`, and reinstall with `npm install`. Do not delete your project source files.
## Companion synchronization and automatic updates

After pairing, installed extensions synchronize through Chrome Companion approximately every 30 seconds. Enable/disable controls remain busy until Chrome returns and the resulting state is checked. A successful **Extension disabled** notice describes a completed action, not a failure. Some browser-managed extensions cannot be toggled; Chrome may also require a confirmation.

The desktop app checks GitHub Releases on startup and every six hours **in installed production builds**, automatically downloads an available update and offers a restart to install it. When launched with `npm run dev`, the Settings page correctly reports **Development**: the updater is intentionally inactive and new source changes must be fetched with `git pull` and restarted locally. A version can only be delivered once a compatible installer and update metadata have been published in Releases. See [release documentation](./RELEASING.md).

## Collect timing logs for troubleshooting

In **Desktop Settings → Diagnostic logs**, click **Open logs folder**. The application writes `bridge-diagnostics.jsonl` in its Electron user-data directory (with a rotating `bridge-diagnostics.previous.jsonl` backup at approximately 2 MB). The log stores timestamps, command types, queue duration, execution duration, overall latency, refresh timing and completion status. It intentionally does **not** store pairing codes, authentication tokens, extension IDs or extension names.

To investigate a delay, keep Chrome and the Companion connected, open **Installed in Chrome**, click **Refresh**, toggle a test extension, and then use **Open logs folder** to find the JSONL file. Send that file together with a description of which button you clicked and the approximate time. Do not publish diagnostics from personal devices in a public GitHub issue without reviewing them.

The **PLATFORMS** sidebar group starts collapsed and can be expanded into platforms and styles. Desktop Settings has **Copy code** next to the pairing code. The Chrome Companion popup has **Paste code**; Chrome may ask for clipboard read permission. You can still paste using Ctrl+V if clipboard access is unavailable.
