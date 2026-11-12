# YouTube — UI Designs and Extensions

[← All platforms](../README.md) · [Home](../../README.md) · [General tools](../../Tools/README.md) · [YouTube gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?platform=youtube)

All YouTube-specific projects are grouped **inside this platform folder**, by style or utility purpose.

| Style/category | Extension | Purpose |
| --- | --- | --- |
| [Glassmorphism](./glassmorphism/README.md) | [YouTube Ambient Light](./glassmorphism/youtube-ambient-light/README.md) | Ambient lighting, focus/lyrics views, glass UI and an equalizer |
| [Utilities](./utilities/README.md) | [YouTube Ad Guard](./utilities/youtube-ad-guard/README.md) | Independent ad request filtering and automatic skip fallback |

## Source and documentation

- **Ambient Light:** [design.md](./glassmorphism/youtube-ambient-light/design.md) · [manifest.json](./glassmorphism/youtube-ambient-light/manifest.json) · [installation](./glassmorphism/youtube-ambient-light/README.md)
- **Ad Guard:** [design.md](./utilities/youtube-ad-guard/design.md) · [manifest.json](./utilities/youtube-ad-guard/manifest.json) · [installation](./utilities/youtube-ad-guard/README.md)

## Install on Chrome

Open the desired extension README. In `chrome://extensions`, enable Developer mode and use **Load unpacked** on that extension's **leaf folder** containing `manifest.json`. Do not load the whole `youtube` directory.

These projects are categorized as browser tools in the searchable gallery, while their code remains organized with the YouTube platform. Ad blocking depends on changes to YouTube's delivery and is not guaranteed to eliminate every ad.

[Navigation conventions](../../docs/NAVIGATION.md) · [Chrome installation guide](../../GETTING_STARTED.md).
