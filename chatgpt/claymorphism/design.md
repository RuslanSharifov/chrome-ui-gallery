# ChatGPT Claymorphism UI — v2.1.0

Chrome Manifest V3 extension that restyles the **existing** ChatGPT website with realistic 3D embedded clay-like design (no new window, no prompts sent, no API calls).

## How it works
1. `glass.css` (injected at `document_start`) is scoped to `html[data-cug-glass]`, so it is inert when disabled.
2. It re-maps ChatGPT's own design tokens (`--text-*`, `--*-surface-*`, `--border-*`, prose vars) per dark / light mode, so text, icons and borders adapt to the background everywhere.
3. **Claymorphism** uses multiple layered shadows for realistic 3D depth and embedded appearance instead of blur effects. Inset shadows create the pressed-in clay effect on all interactive surfaces: sidebar, top bar, composer, menus, dialogs, toasts. Earthy warm color palette gives authentic clay appearance.
4. `fx.js` renders the **dynamic light background** with WebGL: underwater caustics, god rays, neon blobs + ribbons and a cursor glow. It renders at reduced resolution, pauses when the tab is hidden, and falls back to soft CSS blobs if WebGL is unavailable.
5. `content.js` follows ChatGPT's theme, writes the settings, runs the background and implements draggable dialogs.

## Popup settings
- **Presets:** Underwater, Cyberpunk, Aurora, Calm, Minimal.
- **Lights:** on/off, palette (Ocean, Cyberpunk, Aurora, Sunset, Accent), intensity, size, speed (0 = frozen), underwater light, light rays, neon glow, cursor glow, quality (low / medium / high).
- **Clay:** accent colour, shadow depth, panel opacity, chat-area opacity, colour boost, edge highlight, roundness.
- **More:** 3D chat hover, draggable dialogs, reset.
The popup background is a live preview rendered by the same shader.

## Design Philosophy
**Claymorphism** is a realistic 3D design trend featuring:
- **Earthy, warm color palette:** Browns, tans, warm creams for authentic clay appearance
- **Layered shadows:** Multiple shadow layers create realistic depth and dimensionality
- **Inset shadows:** Creates embedded/pressed-in effect on interactive elements
- **Soft, organic shapes:** Rounded corners and smooth transitions
- **Material authenticity:** Simulates tactile clay surfaces with realistic lighting
- **No blur effects:** Uses solid colors with sophisticated shadows for clarity and depth

## Files
`manifest.json`, `glass.css`, `shared.js`, `fx.js`, `content.js`, popup: `index.html` + `style.css` + `script.js`, `icons/`.

## Install
1. `chrome://extensions` → Developer mode → **Load unpacked** → select this folder.
2. After every change click **Reload** on the extension and hard-refresh ChatGPT (Ctrl+Shift+R).

## Troubleshooting
ChatGPT changes its DOM often. If something is not themed: F12 → inspect it → find a `data-testid`, ARIA role or `bg-token-*` / `text-token-*` class and add it to the matching `:is(...)` list in `glass.css`. For claymorphism effects, adjust shadow depth and panel opacity in the Clay settings.
