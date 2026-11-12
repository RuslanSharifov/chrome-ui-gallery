# YouTube Ambient Light — Design

- **Platform:** YouTube
- **Style:** Glassmorphism / ambient video lighting
- **Type:** Chrome Manifest V3 extension
- **Technologies:** JavaScript, CSS, Canvas 2D, Web Audio, Chrome Storage
- **Purpose:** Ambient-light YouTube player enhancements, focus modes, subtitle/lyrics presentation, optional equalizer

## Files

- [README and installation](./README.md)
- [Manifest](./manifest.json)
- [Background toolbar toggle](./background.js)
- [Content JS](./content/content.js)
- [Content CSS](./content/content.css)
- [Detailed settings/features](./docs/README.md)
- [Prototype popup](./popup/popup.html)

## Use

Load this exact folder via `chrome://extensions` → Developer mode → Load unpacked, then open a regular YouTube video. Toolbar clicks toggle ambient lighting; controls are inside the YouTube player. The popup prototype is not enabled by this manifest.

## Gallery

The site catalog treats this as a browser tool while preserving the provided folder and all behavior. The PNG icons are used for the public gallery card and Chrome extension listing.
