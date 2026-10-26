# Instagram Media Saver design

**Platform:** Instagram  
**Style:** Dark glass HUD with gradient accents  
**Technology:** Chrome Manifest V3, JavaScript, CSS, SVG  
**Purpose:** Save directly accessible visible media from a contextual action button while observing the download's completion status.

Open media → click **↓** → bottom-right status panel animates into view → dismiss to a compact pill without canceling → reopen via the pill. The background service worker starts each download and reports completion/error.

## Files

- [manifest.json](./manifest.json)
- [content.js](./content.js)
- [background.js](./background.js)
- [style.css](./style.css)
- [poster.svg](./poster.svg)
- [icon.svg](./icon.svg)
- [gallery.json](./gallery.json)

![Poster](./poster.svg)

**Reuse:** Dynamic SPA UI injection, accessible on-page media detection, and Chrome download status UI. There is no cookie or token extraction and no bypass of restricted accounts. [Install and limitations](./README.md).
