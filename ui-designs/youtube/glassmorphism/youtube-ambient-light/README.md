# YouTube Ambient Light

A YouTube browser extension with an ambient light effect, glass controls, focus layouts, subtitles/lyrics view and an optional five-band audio equalizer.

> This is the upgraded extension supplied in the `update-gallery` branch. Its player interactions and implementation are kept unchanged.

## Install

1. Download the repository ZIP or clone it.
2. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select `ui-designs/youtube/glassmorphism/youtube-ambient-light` (the directory containing `manifest.json`).
4. Open or refresh a YouTube watch page.
5. Click the extension's toolbar icon for **ON/OFF**. Use the added buttons on the YouTube player for the controls and focus mode.

**Important:** This extension does not define a browser action popup. Its settings window is injected into the YouTube player. The separate `popup/` prototype is not active in the manifest.

## Features

- Live ambient colors and adjustable brightness, blur and spread
- Video-only / focus-with-lyrics modes, player buttons and right-side glass tabs
- Optional audio-only mode and five-band equalizer
- Captions and lyrics display using available YouTube subtitle data
- Factory reset via the settings interface

## Source

- [Manifest](./manifest.json)
- [YouTube content logic](./content/content.js)
- [YouTube content styles](./content/content.css)
- [Toolbar background script](./background.js)
- [Standalone popup prototype](./popup/popup.html) — not enabled by the manifest
- [Detailed original documentation](./docs/README.md)
- [Design notes](./design.md)

## Notes

The extension only operates on desktop `www.youtube.com`. YouTube DOM changes, cross-origin video restrictions, captions availability and browser audio policies can affect some features. Video capture and transcription are not transmitted to external servers by the extension. Manual Chrome functional testing is recommended after installing.

This independent project is not affiliated with YouTube or Google.

## Navigation

[← YouTube Glassmorphism](../README.md) · [← YouTube](../../README.md) · [← All platforms](../../../README.md) · [Home](../../../../README.md) · [Ad Guard](../../utilities/youtube-ad-guard/README.md)
