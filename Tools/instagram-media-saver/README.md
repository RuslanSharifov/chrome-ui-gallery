# Instagram Media Saver

[← All tools](../README.md) · [Home](../../README.md) · [Design details](./design.md)

![Extension showcase](./poster.svg)

Chrome Manifest V3 extension for saving accessible video/image resources from visible posts, Reels and Story views. A **↓** icon is injected next to the on-page action buttons. An animated status box appears in the bottom-right corner. Press **×** to minimize it to a chip; the browser download continues independently. Press the chip to reopen status.

## Installation

1. Clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked**, pointing to `Tools/instagram-media-saver`.
4. Refresh Instagram, open a post/Reel/Story and press **↓** beside the controls.

## Limits and privacy

Downloads use Chrome's Downloads API, and only when the media resource URL is accessible. Private-account content may not be downloadable even for followers due to signed URLs and server authorization. No bypass, cookie extraction, login-token reading, credential storage or external service is included. UI reports download completion or failure, not exact byte progress. Instagram DOM updates can affect button placement. Download only content you are entitled to save.

## Source and assets

[Manifest](./manifest.json) · [Content script](./content.js) · [Background](./background.js) · [Styles](./style.css) · [Icon](./icon.svg) · [Poster](./poster.svg) · [Gallery metadata](./gallery.json) · [Design notes](./design.md)

Not affiliated with Instagram/Meta.
