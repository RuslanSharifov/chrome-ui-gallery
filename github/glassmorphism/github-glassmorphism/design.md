# GitHub Glassmorphism Chrome Extension

## Design name
GitHub Glassmorphism

## Platform
GitHub

## Design style
Glassmorphism applied directly to GitHub's existing web UI.

## Purpose
A real Chrome Extension. It does not replace GitHub with a fake dashboard. It keeps GitHub's existing navigation, repository pages, pull requests, issues, forms, menus and content, then adds a translucent glass visual layer.

## Technologies
- Chrome Extension Manifest V3
- HTML5 / CSS3
- Vanilla JavaScript
- CSS backdrop-filter
- chrome.storage.local
- activeTab

## Files
- [Manifest](./manifest.json)
- [Popup HTML](./index.html)
- [Popup CSS](./style.css)
- [Popup JavaScript](./script.js)
- [GitHub Glass CSS](./glass.css)
- [Content Script](./content.js)

## How to use
1. Open chrome://extensions.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this folder.
5. Open https://github.com/.
6. Click the extension icon and choose a preset.

## Behavior
The content script runs on GitHub pages and styles common Primer surfaces. The popup controls blur, opacity, edge shine, corner radius, colour saturation, ambient light, hover lift and motion. Settings persist locally.

## Presets
- Aurora
- Midnight
- Crystal

## Important
This extension is presentation-only. It does not use the GitHub API and does not create, delete, read or modify repository data. GitHub can change DOM/class names, so selectors in glass.css may need maintenance over time.

## Navigation
- [GitHub UI Designs](../README.md)
- [Glassmorphism designs](../README.md)
- [Repository root](../../../README.md)
