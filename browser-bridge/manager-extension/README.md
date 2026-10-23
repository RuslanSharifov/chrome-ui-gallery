# Chrome UI Gallery Companion

The **Chrome UI Gallery Companion** connects Chrome to the open-source [Desktop Manager](../../apps/desktop/README.md). It allows the desktop app to display installed extensions and enable or disable those that Chrome permits you to manage.

## Requirements

- Google Chrome with access to `chrome://extensions`
- The [Chrome UI Gallery Desktop App](../../apps/desktop/README.md) running on the **same computer**
- A cloned or downloaded copy of this repository
- Permission to use Chrome's Developer mode and install local extensions

## 1. Download the project

If you have not downloaded the repository, open PowerShell or Terminal:

```bash
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

The Companion is located at `browser-bridge/manager-extension/`. Do **not** select `browser-bridge/` or the entire repository during extension installation.

## 2. Install Chrome Companion

1. Open Chrome and navigate to **`chrome://extensions`**.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the **`chrome-ui-gallery/browser-bridge/manager-extension`** folder containing `manifest.json`.
5. Confirm that **Chrome UI Gallery Companion** appears in your Chrome extension list and is enabled.
6. Click the puzzle-piece extension icon in the toolbar and optionally **pin** the Companion for convenient access.

The Companion asks for the **management**, **storage**, and **alarms** permissions, plus access to **`http://127.0.0.1:41739`**. These permissions are used to list/manage installed extensions, save the local pairing token, and periodically synchronize.

## 3. Start Desktop Manager

From the repository root:

```bash
cd apps/desktop
npm install
npm run dev
```

In the desktop window select **Settings → Chrome Companion**. The app displays an eight-character pairing code. Keep the desktop app open.

## 4. Pair Chrome with the desktop app

1. Click the **Chrome UI Gallery Companion** toolbar icon in Chrome.
2. Enter the pairing code currently shown in Desktop Settings.
3. Click **Connect**.
4. Return to Desktop Settings and confirm the browser status changes from **Offline** to **Connected**.
5. Choose **Installed in Chrome** to see the installed extension list.

Codes are single-use and rotate after successful pairing. A previously paired Chrome session normally reconnects automatically when the desktop app stays running; after the desktop app restarts, you may need to enter a fresh code.

## 5. Manage installed extensions

Open **Installed in Chrome** to find extensions and their status. Use the toggle to request **Enable** or **Disable**. Wait until Chrome reports the updated status. The companion checks the actual Chrome state rather than assuming a button click succeeded.

**Important:** A desktop manager cannot silently install arbitrary unpacked extensions into a normal Chrome profile. Use **Prepare for Chrome** in a project detail view to download and extract files, then finish installing with **Load unpacked** in Chrome. Also, some Chrome-managed extensions cannot be disabled, and Chrome may ask for confirmation.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| Desktop says **Offline** | Ensure both apps are open; check `chrome://extensions` and the Companion's enabled status; use a new pairing code |
| **Pairing code invalid** | Copy the current code from Desktop Settings, not an old screenshot |
| Extensions do not appear | Click **Refresh Chrome extensions** and check the spinning indicator and last-sync time; reload Companion if the request fails |
| Enable/disable appears stuck | Update and reload the Companion, then retry; the local connection now uses long polling to deliver commands without waiting for the next alarm |
| Chrome blocks the action | Check whether Chrome manages the extension or requires user confirmation |
| **Cannot connect** | Verify the desktop app is running and that local port `127.0.0.1:41739` is not blocked or occupied |
| App says **Extension disabled** | This indicates the extension was disabled successfully, not an error. Check the switch/status for confirmation |

To update a locally unpacked Companion, run `git pull origin main` in your repository and click the **Reload** icon on its card in `chrome://extensions`. Restart the Desktop App to load the updated bridge code.

## Security and privacy

- The Companion only contacts **localhost** (`127.0.0.1`), not a remote management server.
- The local connection uses a pairing code followed by a bearer token.
- It does not access webpage contents or browsing history.
- It cannot disable itself and cannot override Chrome's management restrictions.
- Chrome must be running for live extension management. Keep your pairing code private and review extension permissions.
- Disconnect from **Desktop Settings** to revoke the current local connection.

## Source files

[Manifest](./manifest.json) · [Service worker](./background.js) · [Popup](./popup.html) · [Popup script](./popup.js) · [Desktop bridge](../../apps/desktop/electron/bridge.cjs)

## Live connection and refresh (new)

The desktop bridge now holds a local poll open for up to 18 seconds so that **Enable / Disable** and **Refresh Chrome extensions** commands can be delivered promptly. The 30-second Chrome alarm remains a fallback. A completed refresh displays a success message and last-sync time in the desktop app. A spinner is displayed while synchronizing.

**After updating this code:** stop Desktop Manager, run `git pull origin main`, restart with `npm run dev`, then open `chrome://extensions` and click **Reload** on **Chrome UI Gallery Companion**. Both sides must use the revised protocol. If Chrome itself blocks an extension state change, its error should be displayed instead of reporting a successful toggle.
