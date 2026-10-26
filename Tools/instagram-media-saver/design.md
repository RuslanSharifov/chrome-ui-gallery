# Media Island v2 — Design documentation

**Platform:** Instagram / Chrome  
**Style:** Gradient-glass + slime morphing island  
**Stack:** Manifest V3, JS, CSS and SVG  
**Goal:** A small always-on media saving utility that smoothly transitions between idle, active download, and detailed library/player/settings views.

## Three states

1. **Small** floating pill (always visible, movable).
2. **Medium** horizontal rectangle appearing during active downloads.
3. **Large** floating container with media library, video preview and player controls (play/pause, previous, next, volume).

The big view contains back navigation, link entry, remove-from-list-only, and customizable themes. UI uses system fonts, translucent blurred surfaces, gradient accent, reduced-motion support and draggable coordinates persisted in extension storage.

## Architecture

- [content.js](./content.js) scans dynamically loaded media and owns island UI.
- [background.js](./background.js) saves through `chrome.downloads.download`, persists library metadata, reports completion/error.
- [style.css](./style.css) handles all three morphing sizes and theme variables.
- [manifest.json](./manifest.json) scopes Chrome permissions.
- [gallery.json](./gallery.json) controls automatic catalog metadata.
- [icons/icon.svg](./icons/icon.svg) shows logo.
- [poster.svg](./poster.svg) is the gallery illustration.

[← Installation and limitations](./README.md)
