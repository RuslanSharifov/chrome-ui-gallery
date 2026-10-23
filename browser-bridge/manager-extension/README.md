# Chrome UI Gallery Companion

Local-only Chrome extension that pairs with the [Desktop Manager](../../apps/desktop/README.md) and lets it list and enable/disable eligible installed extensions through the Chrome `management` API.

## Installation

1. Open `chrome://extensions`, turn on Developer mode, and choose **Load unpacked**.
2. Select this `manager-extension` folder.
3. Run Chrome UI Gallery Desktop. Copy its pairing code into the companion's toolbar popup.
4. Keep Chrome running. The desktop catalog will show installed extension statuses when connected.

The companion cannot disable itself, cannot manage extensions restricted by Chrome, and cannot operate if Chrome is closed. It calls only `http://127.0.0.1:41739` (local computer). Keep pairing codes private. To revoke desktop pairing, use Disconnect in desktop settings. No browsing history or website content is accessed.

Files: [manifest](./manifest.json) · [background](./background.js) · [popup](./popup.html)
