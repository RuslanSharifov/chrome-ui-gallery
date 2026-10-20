# Cookie Manager Pro

- **Category:** Chrome extension / utility
- **Platform:** Chromium-based browsers
- **Technologies:** JavaScript, HTML, CSS, Chrome Extension Manifest V3
- **Purpose:** View, edit, create and delete browser cookies; manage cookie profiles and clearing workflows.
- **Version:** 2.1.0 (from `manifest.json`)

## Files
- [Manifest](./manifest.json) — permissions, commands and extension entry points
- [Popup UI](./popup.html) and [popup behavior](./popup.js)
- [Options UI](./options.html) and [options logic](./options.js)
- [Background service worker](./background.js)
- [Common logic](./common.js)
- [Translations](./i18n.js)
- [Styles](./styles.css)
- [Icons](./icons/icon128.png)

## Install and use
1. Open `chrome://extensions`, enable Developer mode and select **Load unpacked**.
2. Choose `Tools/cookie-manager-pro` (the directory containing `manifest.json`).
3. Use the toolbar icon to access the cookie manager, or open the extension's options page for settings.
4. Review the permissions before enabling it: the manifest requests cookies, browsing data and access to all URLs.

**Suitable for:** browser troubleshooting, cookie testing, development workflows and local browser data management.

[← Tools](../README.md) · [← Repository](../../README.md)
