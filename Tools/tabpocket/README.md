# TabPocket

## Preview

![ TabPocket extension preview](./download%20(1).png)

The image shows the extension's interface and key actions. [View the image](./download%20(1).png) · [Browse the live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?category=tool&q=TabPocket).

Save your tabs. Organize your browser.

## Features
- Save the current window's tabs with a selection dialog (select/deselect, select all/none), into a new or existing collection. Duplicates are skipped.
- Optional: close the selected tabs after saving (asks for confirmation unless disabled).
- Open all, or open only selected tabs. Identical URLs are focused instead of duplicated (configurable).
- Search collections; sort A–Z, newest, or favorites first; star favorites; expand a preview of a collection's tabs.
- Collection page: search saved tabs, add URLs manually, move selected tabs to another collection, rename, remove, delete.
- Settings: light/dark theme, duplicate handling, delete and close confirmations.
- Export all collections to JSON; import a TabPocket backup (validated, size-limited, duplicate IDs regenerated).
- Local storage only (`chrome.storage.local`). No accounts, servers, analytics, or history collection.

## Install
1. Download the extension from the [live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?category=tool&q=TabPocket) using **Download ZIP**, or download the [repository ZIP](https://github.com/RuslanSharifov/chrome-ui-gallery/archive/refs/heads/main.zip).
2. Extract the ZIP. If you downloaded the entire repository, navigate to `Tools/tabpocket/`.
3. Open `chrome://extensions`, enable **Developer mode**.
4. Click **Load unpacked** and select the folder containing this extension's `manifest.json` (the `tabpocket` folder).

## Usage
- **Save:** click the icon → **Save current tabs…** → name the collection → **Save**.
- **Open all:** **Open all** on a collection card.
- **Open selected:** **Explore** → tick tabs → **Open selected**.

## Permissions
- `tabs`: read URLs/titles of open tabs; open and focus tabs.
- `storage`: save collections and settings locally.
- `favicon`: show site icons from Chrome's favicon cache.

## Gallery
[Find TabPocket in the live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?category=tool&q=TabPocket) · [All tools](../README.md) · [Repository home](../../README.md)

## Structure
[manifest.json](manifest.json) · [popup/](popup/) · [dashboard/](dashboard/) · [settings/](settings/) · [shared/](shared/) · [icons/](icons/)

## Privacy
No browsing history collection, no data sent anywhere, no tracking or ads.

## Known limitations
- Drag-and-drop between collections is not implemented (use Move).
- Saving covers the current window only; saving all windows is not implemented.
- No collection description field.
- Dashboard does not have its own favorite/sort controls (use the popup).
- Verified with static checks only; not run in a live Chrome session.

## Author
Ruslan Sharifov · [GitHub](https://github.com/RuslanSharifov) · [Chrome UI Gallery](https://github.com/RuslanSharifov/chrome-ui-gallery) · [Live Gallery](https://ruslansharifov.github.io/chrome-ui-gallery/)

## License
MIT. See [LICENSE](LICENSE).
