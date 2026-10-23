# GitHub Liquid Glass

- **Platform:** GitHub
- **Style:** Liquid glass / glassmorphism
- **Technologies:** HTML, CSS, JavaScript, Chrome Extension Manifest V3
- **Purpose:** Apply configurable refractive glass surfaces and animated backgrounds to GitHub pages.

## Files
- [Manifest](./manifest.json) — browser extension declaration
- [Page integration](./content.js) — inserts or orchestrates page styling
- [Glass styling](./glass.css) — themed surfaces
- [Base styling](./style.css) — settings UI
- [Popup](./index.html) and [popup logic](./script.js)
- [Liquid effects](./liquid.js) and [background effects](./bg.js)
- [Options page](./options.html)
- [Full usage and options](./README.md)

## Use
Go to `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose this directory. Open GitHub, then adjust settings in the extension.

**Suitable for:** browser theming prototypes, liquid-glass surface experiments, and GitHub UI customization.

[← GitHub designs](../README.md) · [← Repository](../../../README.md)
