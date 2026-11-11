# YouTube Ambient Glow Lite — Design & implementation

- **Platform:** YouTube
- **Type:** Chrome extension (Manifest V3)
- **Style:** Minimal dark popup / ambient-video lighting
- **Technologies:** Vanilla JavaScript, CSS, Canvas 2D, Chrome Storage API
- **Goal:** Lightweight dynamic lighting that mirrors edge colors from the playing video without capturing tabs or transmitting data.

## Files

- [Manifest](./manifest.json) — permissions and YouTube-only content script
- [Content script](./content.js) — edge-color sampling and lifecycle handling
- [Glow styles](./style.css) — four directional shadow layers
- [Popup](./popup.html) — controls
- [Popup styles](./popup.css) — dark UI
- [Popup logic](./popup.js) — saved settings
- [README](./README.md) — installation and compatibility

## How it works

On standard YouTube watch pages, a 24×16 offscreen canvas samples the video's edge regions at 1–8 fps. Exponential smoothing stabilizes transitions; four CSS shadows color the surroundings of the player. Navigation, visibility and fullscreen transitions suspend or resume sampling.

## Usage

Load the folder containing `manifest.json` through `chrome://extensions` → **Developer mode** → **Load unpacked**. Open a YouTube watch page and use the toolbar popup.

**Limitations:** Canvas access is blocked for certain DRM/cross-origin sources; glow is disabled in that case. The tool does not bypass these restrictions. Does not operate on Shorts, embeds, mobile YouTube, or browser fullscreen.

## Reuse

Useful as a small reference for DOM-based YouTube enhancements, canvas color extraction, and MV3 content scripts. No external dependencies or build step.
