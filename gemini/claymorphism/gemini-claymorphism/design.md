# Gemini Claymorphism UI

## Design name

Gemini Claymorphism

## Platform

Google Gemini Web App (gemini.google.com)

## Design style

Claymorphism with soft sculpted depth, rounded pastel surfaces, inset highlights, offset shadows, and animated 3D clay clouds behind the Gemini interface.

## Technology

- Chrome Extension Manifest V3
- HTML5
- CSS3
- Vanilla JavaScript
- CSS 3D transforms and keyframe animation
- chrome.storage.local
- Chrome content scripts

## Purpose

This extension restyles the existing Gemini web interface without replacing Gemini, opening another Gemini window, sending prompts, calling a Gemini API, or changing conversation logic.

The visual layer uses a clay-like material system for the sidebar, conversation surfaces, composer, query bubbles, dialogs, menus, cards, code blocks, and controls. The background is an animated cloud field built locally from layered CSS 3D shapes.

## Main visual system

1. Soft pastel canvas matched to the selected palette.
2. Claymorphic Gemini surfaces with rounded sculpted geometry.
3. Animated 3D clouds positioned behind the UI.
4. Adjustable cloud speed, size, count, opacity, and depth.
5. Optional cursor parallax for the cloud layer.
6. Optional 3D hover treatment for navigation items.
7. Light and dark mode detection.
8. Reduced-motion support.

## Cloud controls

The popup exposes:

- Cloud speed
- Cloud size
- Cloud count
- Cloud opacity
- 3D depth
- Cursor parallax

The renderer creates seven rounded clay puffs per cloud. No remote image, CDN, external font, or API is required.

## Files

- manifest.json — Manifest V3 registration for gemini.google.com.
- shared.js — defaults, palettes, presets, validation, and storage helpers.
- clouds.js — reusable 3D cloud generator for the content layer and popup preview.
- clouds.css — animated cloud geometry and reduced-motion rules.
- content.js — theme detection, CSS variables, cloud lifecycle, and settings synchronization.
- clay.css — Gemini-specific claymorphism selectors and surface overrides.
- index.html — extension popup markup.
- style.css — popup claymorphism styling.
- script.js — popup controls, preview, and storage actions.
- design.md — design documentation and setup instructions.
- CHANGELOG.md — release notes.

## CMD setup

~~~cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
cd geminiclaymorphismgemini-claymorphism
~~~

## Install as an unpacked Chrome extension

The folder containing manifest.json is the extension root.

1. Open Chrome.
2. Go to chrome://extensions.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select gemini-claymorphism.
6. Open or refresh https://gemini.google.com/.
7. Click the extension toolbar button.
8. Enable the visual layer and adjust the cloud controls.

## Development loop

1. Edit clay.css, clouds.css, clouds.js, content.js, or popup files.
2. Return to chrome://extensions.
3. Click Reload for Gemini Claymorphism.
4. Refresh the Gemini tab.
5. Adjust cloud speed, size, count, opacity, and depth from the popup.
6. If a Gemini surface is not styled, inspect the current DOM and add a narrow selector to clay.css.

## Troubleshooting

### The extension loads but Gemini is unchanged

Reload the extension, refresh Gemini, and confirm the master switch is enabled.

### Clouds are too strong

Reduce Cloud opacity, Cloud size, or 3D depth.

### Clouds move too quickly

Lower Cloud speed.

### Performance is poor

Reduce Cloud count and 3D depth, or enable reduced motion in the operating system.

### A Gemini panel is not clay-styled

Gemini can change its DOM between releases. Inspect the current element and add a defensive selector instead of relying on generated class names.

## Safe extension boundaries

- Does not send or modify prompts.
- Does not call Gemini or Google APIs.
- Does not scrape conversation content.
- Does not open a replacement chat window.
- Does not modify Gemini responses.
- Does not inject third-party remote scripts.

## Files

- HTML: ./index.html
- Main CSS: ./clay.css
- Cloud CSS: ./clouds.css
- Popup CSS: ./style.css
- JavaScript: ./script.js
- Content script: ./content.js
- Shared settings: ./shared.js
- Cloud renderer: ./clouds.js
- Manifest: ./manifest.json
