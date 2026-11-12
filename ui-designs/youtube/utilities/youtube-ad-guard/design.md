# YouTube Ad Guard — Design

- **Design name:** YouTube Ad Guard — Block & Auto Skip
- **Platform:** YouTube / Google Chrome
- **Design style:** Dark glass-inspired utility popup with high-contrast independent switches
- **Technologies:** HTML, CSS, vanilla JavaScript, Chrome Manifest V3, declarativeNetRequest, storage
- **Purpose:** Reduce unwanted YouTube ads with independently controllable request filtering and automatic ad skipping
- **Privacy:** Local settings only; no tracking or external code
- **Preview:** Toolbar popup in Chrome; gallery uses palette from [gallery.json](./gallery.json)
- **Reusable for:** MV3 browser-utility demos, local browser controls and educational examples
- **Caveats:** Player selectors and ad delivery can change. Zero ads cannot be guaranteed.

## Files

[Manifest](./manifest.json) · [Request rules](./rules/ads.json) · [Background service worker](./background.js) · [Content script](./content.js) · [HTML](./popup.html) · [CSS](./popup.css) · [JavaScript](./popup.js)

## Use

See [installation and testing](./README.md). Block mode controls the Chrome static ruleset and ad-slot CSS. Auto skip acts only while the page identifies an ad player, attempting button clicks, seeking and temporary accelerated muted ad playback. Once the ad state ends it restores playback settings where possible.
