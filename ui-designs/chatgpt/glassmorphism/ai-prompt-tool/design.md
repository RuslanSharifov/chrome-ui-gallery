# ChatGPT Glassmorphism UI — v2.1.0

Chrome Manifest V3 extension that restyles the **existing** ChatGPT website (no new window, no prompts sent, no API calls).

## How it works
1. `glass.css` (injected at `document_start`) is scoped to `html[data-cug-glass]`, so it is inert when disabled.
2. It re-maps ChatGPT's own design tokens (`--text-*`, `--*-surface-*`, `--border-*`, prose vars) per dark / light mode, so text, icons and borders adapt to the background everywhere.
3. Glass (blur + sheen + hairline border) is applied only to leaf surfaces: sidebar, top bar, composer, menus, dialogs, toasts. The big chat area and all page wrappers are see-through.
4. `fx.js` renders the **dynamic light background** with WebGL: underwater caustics, god rays, neon blobs + ribbons and a cursor glow. It renders at reduced resolution, pauses when the tab is hidden, and falls back to soft CSS blobs if WebGL is unavailable.
5. `content.js` follows ChatGPT's theme, writes the settings, runs the background and implements draggable dialogs.

## Popup settings
- **Presets:** Underwater, Cyberpunk, Aurora, Calm, Minimal.
- **Lights:** on/off, palette (Ocean, Cyberpunk, Aurora, Sunset, Accent), intensity, size, speed (0 = frozen), underwater light, light rays, neon glow, cursor glow, quality (low / medium / high).
- **Glass:** accent colour, blur, panel opacity, chat-area opacity, colour boost, edge shine, roundness.
- **More:** 3D chat hover, draggable dialogs, reset.
The popup background is a live preview rendered by the same shader.

## Files
`manifest.json`, `glass.css`, `shared.js`, `fx.js`, `content.js`, popup: `index.html` + `style.css` + `script.js`, `icons/`.

## Install
1. `chrome://extensions` → Developer mode → **Load unpacked** → select this folder.
2. After every change click **Reload** on the extension and hard-refresh ChatGPT (Ctrl+Shift+R).

## Troubleshooting
ChatGPT changes its DOM often. If something is not themed: F12 → inspect it → find a `data-testid`, ARIA role or `bg-token-*` / `text-token-*` class and add it to the matching `:is(...)` list in `glass.css`. If the page feels slow, set Quality to Low or lower the Blur.
