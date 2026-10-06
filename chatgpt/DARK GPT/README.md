# ChatGPT DARK GPT

![ChatGPT DARK GPT preview](./preview.svg)

A dark-only red redesign of ChatGPT: deep-black glass surfaces, a red WebGL ambient glow, a pointer-following light and an **interactive particle welcome headline**.

## Welcome headline
On a new chat, the greeting ("Ready when you are.") turns into particles. Move the mouse over it to repel, attract or swirl them, click for a burst. Everything is adjustable in the popup (effect, radius, strength, density, size) and can be switched off.

## Settings
- DARK GPT on/off
- Welcome text: particles on/off, mouse effect, radius, strength, density, size
- Pointer light: on/off, radius
- Surfaces: panel opacity, chat area tint, ambient red glow, background quality, 3D hover

## Files
- [Design notes](./design.md) · [Changelog](./CHANGELOG.md)
- [manifest.json](./manifest.json), [dark-gpt.css](./dark-gpt.css), [content.js](./content.js), [textfx.js](./textfx.js), [fx.js](./fx.js), [shared.js](./shared.js)
- Popup: [index.html](./index.html), [style.css](./style.css), [script.js](./script.js)

## Install
`chrome://extensions` → Developer mode → Load unpacked → select this folder. After editing, press Reload and refresh ChatGPT.
