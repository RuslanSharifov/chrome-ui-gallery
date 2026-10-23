# Gemini Claymorphism

A Chrome Manifest V3 extension that gives [Google Gemini](https://gemini.google.com/) a soft 3D clay-inspired interface, with animated clouds, customizable weather and optional clay-to-glass styling.

## Animated preview

![Gemini Claymorphism animated preview](./gemini-claymorphism-preview.gif)

[Open full-size GIF](./gemini-claymorphism-preview.gif) · [Live gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?category=ui&q=Gemini%20Claymorphism) · [Detailed design documentation](./design.md)

## Features

- Rounded clay surfaces, soft shadows and pastel-style depth.
- Animated 3D clouds and weather effects: clear, cloudy, rain, storm, snow, fog and night.
- Adjustable transparency to blend claymorphism and glassmorphism.
- Theme modes: Auto, Follow Gemini, Light and Dark.
- Customizable visual effects, including reduced-motion support.
- Visual-only customization: no prompts sent to external APIs.

## Installation

1. Download the repository or this extension's ZIP from the [gallery](https://ruslansharifov.github.io/chrome-ui-gallery/gallery.html?category=ui&q=Gemini%20Claymorphism).
2. Open `chrome://extensions`, enable **Developer mode**, and click **Load unpacked**.
3. Select this `gemini-claymorphism` folder, which directly contains [manifest.json](./manifest.json).
4. Open or refresh [Gemini](https://gemini.google.com/) and click the extension toolbar icon to configure the theme.

## Files

- [design.md](./design.md) — design details, settings and troubleshooting.
- [manifest.json](./manifest.json) — Chrome extension configuration.
- [clay.css](./clay.css) — claymorphism UI styles.
- [clouds.css](./clouds.css), [clouds.js](./clouds.js) — animated cloud scene.
- [weather.js](./weather.js) — weather effects.
- [content.js](./content.js), [shared.js](./shared.js) — Gemini integration and preferences.
- [index.html](./index.html), [style.css](./style.css), [script.js](./script.js) — popup controls.
- [gallery.json](./gallery.json) — gallery metadata.
- [CHANGELOG.md](./CHANGELOG.md) — changes by version.
- [Animated preview](./gemini-claymorphism-preview.gif) — the actual demonstration GIF.

## Navigation

[← Claymorphism overview](../README.md) · [← Gemini designs](../../README.md) · [← Gallery home](../../../../README.md)
