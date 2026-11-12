# YouTube Ad Guard — Block & Auto Skip

Chrome Manifest V3 extension with **two independently configurable features**.

- **Block ad requests** (default ON): activate a YouTube-scoped `declarativeNetRequest` ruleset for known ad domains/paths, and hide recognizable ad slots/overlays.
- **Auto skip ads** (default ON): on a player marked `ad-showing`, click an enabled Skip button immediately, try to seek to the end, and use temporary mute + 16× playback as a fallback. Playback rate and mute state are restored when the ad ends.

> **Limitations:** No ad-blocking extension can guarantee zero ads on YouTube permanently. YouTube changes ad delivery; ads embedded in the main video stream or unskippable server-enforced ads may resist skipping. The fallback minimizes exposure, but cannot promise an instant skip for every ad.

## Installation

1. Download or clone [Chrome UI Gallery](https://github.com/RuslanSharifov/chrome-ui-gallery).
2. Go to `chrome://extensions` in Google Chrome; turn on **Developer mode**.
3. Click **Load unpacked** and select the exact `youtube/extensions/youtube-ad-guard/` folder.
4. Open YouTube and click the extension icon (pin it from the Extensions menu if necessary).
5. Both switches start ON. Switch off either one independently to customize behavior.
6. Reload any YouTube tab opened before installation, especially after enabling network blocking.

Once this PR merges and GitHub Pages publishing succeeds, the [Chrome UI Gallery website](https://ruslansharifov.github.io/chrome-ui-gallery/) will automatically discover the extension and provide a ZIP build.

## Independent switches

| Request blocking | Auto skip | Behavior |
| --- | --- | --- |
| ON | ON | Filters known ad requests and skips detected in-player ads |
| ON | OFF | Only network/visible ad filtering |
| OFF | ON | Only player skip/seek/accelerate fallback |
| OFF | OFF | No filtering or skipping |

## Privacy and permissions

- **storage:** save two Boolean preferences locally; no cloud sync.
- **declarativeNetRequest:** turn the packaged blocking rules on and off.
- **Content script:** restricted to YouTube subdomains; watches for the `ad-showing` player state.
- Network rules use `initiatorDomains: ["youtube.com"]`. They never block generic `googlevideo.com/videoplayback` or `youtubei/v1/player` traffic, avoiding widespread playback breakage.
- No analytics, authentication, external code, external requests from the extension, or third-party dependencies. The Ko-fi and GitHub URLs open only when clicked.

## Files

- [manifest.json](./manifest.json)
- [rules/ads.json](./rules/ads.json)
- [background.js](./background.js)
- [content.js](./content.js)
- [popup.html](./popup.html)
- [popup.css](./popup.css)
- [popup.js](./popup.js)
- [gallery.json](./gallery.json)
- [design.md](./design.md)
- [Smoke tests](./tests/smoke.test.cjs)

## Testing

Run from the repository root:

```sh
node --test youtube/extensions/youtube-ad-guard/tests/smoke.test.cjs
node scripts/build-catalog.mjs
node scripts/test-catalog.mjs
node scripts/validate.mjs
```

Manual checks in Chrome: four combinations of switches; a normal video is never sought/muted/accelerated; skippable and unskippable ad conditions; navigation between YouTube videos; ruleset toggling; popup links. Automated smoke checks cannot establish whether YouTube ads are currently blocked.

If playback breaks, disable **Block ad requests** first to isolate network filtering. If playback speed or mute behaves unexpectedly, disable **Auto skip ads**. Remove or reload the extension at `chrome://extensions`.

## Links

- [Source repository](https://github.com/RuslanSharifov/chrome-ui-gallery)
- [Support on Ko-fi](https://ko-fi.com/ruslansharifov)

Independent community project, not affiliated with YouTube or Google.
