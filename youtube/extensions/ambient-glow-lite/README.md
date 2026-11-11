# ✦ YouTube Ambient Glow Lite

A tiny, open-source **Manifest V3** Chrome extension that adds cinematic, dynamic ambient lighting around YouTube videos. The glow follows colors near the video's edges using local canvas sampling and smooth CSS shadows.

## Features

- 🎨 Four-sided, frame-responsive lighting with smooth color transitions
- 🎚️ Intensity, glow spread, and frame sampling rate (1–8 fps)
- ⏻ Simple ON/OFF switch; preferences sync with Chrome
- 🔒 No analytics, tracking, network calls, or broad browser permissions
- 🪶 Vanilla JavaScript and CSS; no build tools or dependencies

## Install (unpacked)

1. Clone the repository: `git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git` (or download its ZIP and extract it).
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** in the upper-right corner.
4. Click **Load unpacked**.
5. Select the **`youtube/extensions/ambient-glow-lite`** folder (the one containing `manifest.json`).
6. Open or refresh `https://www.youtube.com/watch?v=...` and start playback.
7. Pin **YouTube Ambient Glow Lite** to the toolbar and use its popup to change options.

When editing code, click **Reload** on the extension card in `chrome://extensions`, then refresh YouTube.

## Project files

| File | Purpose |
| --- | --- |
| [manifest.json](./manifest.json) | MV3 configuration, storage permission, YouTube match |
| [content.js](./content.js) | Video sampling, color smoothing, page lifecycle |
| [style.css](./style.css) | Ambient directional shadows |
| [popup.html](./popup.html) | Popup UI |
| [popup.css](./popup.css) | Popup presentation |
| [popup.js](./popup.js) | Persistent controls |
| [design.md](./design.md) | Design and implementation notes |

## Compatibility and limits

Designed for **desktop Chrome** on regular YouTube watch pages only. No Shorts, embeds, or mobile YouTube support. The glow turns off during fullscreen and when the tab is hidden. Videos with DRM or cross-origin restrictions may prevent canvas readback; the extension then stops the effect rather than attempting to bypass browser protections. YouTube layout changes could require selector updates.

The extension samples a 24×16 canvas at a configurable 1–8 fps to minimize overhead. Defaults: 4 fps, 65% intensity, 55% spread. Video pixels and preferences are processed locally; preferences use `chrome.storage.sync`.

## Privacy

Only the `storage` permission is requested. The content script is restricted to `https://www.youtube.com/*`. No remote services, telemetry, third-party libraries, or video recording.

## Contributing

Report compatibility issues or send PRs in [Chrome UI Gallery](https://github.com/RuslanSharifov/chrome-ui-gallery). Include Chrome version, YouTube page type, and whether the video is protected.

This independent project is not affiliated with YouTube or Google. See the repository's license.
