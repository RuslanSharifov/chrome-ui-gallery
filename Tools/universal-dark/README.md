# Universal Dark

![Universal Dark](./icon.svg)

Give the current website a dark appearance. Simple controls for per-site on/off, brightness and contrast. Settings are stored locally in Chrome.

## Installation

1. Open `chrome://extensions`, enable Developer mode.
2. Choose **Load unpacked**, select `Tools/universal-dark`.
3. Open a normal website and click the Universal Dark toolbar icon.
4. Toggle Dark mode; adjust brightness or contrast if desired.

**Important limitations:** To restore your saved per-site preference automatically after a page reload, Chrome injects the small local content script on standard HTTP/HTTPS websites. The extension asks for broad website access for this feature, but does not read or transmit page content. Dynamic websites can display imperfect image or color results; disable the mode on affected pages. Chrome internal pages and the Chrome Web Store are protected. This extension does not access the user's passwords or transmit page content. It uses the `storage` permission and a website content script to apply only enabled sites, along with `tabs` to display the active domain. The optional Ko-fi card uses the public online support config and hides offline.

## Source files

- [manifest](./manifest.json) · [popup](./popup.html) · [popup logic](./popup.js)
- [local page styling](./content.js) · [background](./background.js)
