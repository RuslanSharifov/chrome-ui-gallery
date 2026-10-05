# ChatGPT DARK GPT

## Design name
DARK GPT

## Platform
ChatGPT

## Style
Dark GPT — deep-black surfaces, layered crimson/red accents, red ambient glow and a red ChatGPT-style identity.

## Goal
Keep the existing ChatGPT UI structure, interactions, dialogs, menus, composer and navigation intact while replacing the visual language with a dark red model.

## Settings
- DARK GPT mode: enable / disable
- UI brightness: panel/surface brightness
- Background glow: red ambient brightness

## Files
- [Manifest](./manifest.json)
- [Injected CSS](./dark-gpt.css)
- [Content script](./content.js)
- [Shared settings](./shared.js)
- [Background renderer](./fx.js)
- [Popup HTML](./index.html)
- [Popup CSS](./style.css)
- [Popup JavaScript](./script.js)

## Install
Open chrome://extensions, enable Developer mode, choose Load unpacked, and select this folder.

## Reference implementation
The selector coverage and UI behavior are based on the existing ChatGPT Glassmorphism implementation in this repository. Existing designs are not deleted or overwritten.
