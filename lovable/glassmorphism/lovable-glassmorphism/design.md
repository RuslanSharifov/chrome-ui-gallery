# Lovable Glassmorphism UI — v1.0.0

Chrome Manifest V3 extension that restyles the **existing** Lovable website (`lovable.dev`) with an adaptive glassmorphism theme. It does not open new windows, send prompts or call any API — it only changes how the page looks.

## Visual system
- **Glass surfaces:** translucent fill + `backdrop-filter: blur() saturate()` + 1px hairline border + optional top edge shine.
- **Background:** a live, slowly drifting field of soft colour lights (default palette uses Lovable's pink → orange → violet → blue gradient) plus a light ribbon and an optional cursor glow.
- **Adaptive:** follows Lovable's own dark / light theme (`html.dark` / `color-scheme`) and switches glass tint, hairlines and sheen accordingly.
- **Accent colour:** used for the composer focus glow, scrollbars, text selection, card hover glow and the cursor light.

## How it works
1. `glass.css` is injected at `document_start` and scoped to `html[data-lg-glass]`, so it is inert when the extension is switched off.
2. Lovable is built with shadcn/Tailwind. The stylesheet targets shared building blocks — `aside`, `nav`, `header`, Radix `role="dialog" | "menu" | "listbox"`, popper wrappers, Sonner toasts, the chat composer (`form:has(textarea)`) and `bg-card / bg-popover / bg-muted / bg-sidebar` utility classes — instead of fragile generated class names.
3. Glass is applied only to leaf surfaces. Large wrappers are see-through so the lights shine through. The project **preview iframe stays opaque**, so the user's app is rendered unchanged.
4. `fx.js` draws the background on a Canvas 2D at reduced resolution (Low 30% / Medium 50% / High 75%), blurs it with CSS, and pauses when the tab is hidden. No WebGL is required.
5. `content.js` reads settings, writes CSS variables (`--lg-blur`, `--lg-panel-alpha`, `--lg-accent-rgb`, ...), syncs the theme via a `MutationObserver` and re-attaches the canvas if the SPA replaces `<body>` children.
6. `shared.js` holds defaults, presets, palettes and `chrome.storage.local` helpers used by both the content script and the popup.

## Popup settings
- **Presets:** Lovable, Ocean, Aurora, Calm, Minimal.
- **Lights:** on/off, palette (Lovable, Ocean, Aurora, Sunset, Mono), intensity, size, speed (0 = frozen), cursor glow, quality (low / medium / high).
- **Glass:** accent colour, blur, panel opacity, chat-area opacity, colour boost, roundness, edge shine.
- **Reset** to defaults.

The popup background is a live preview rendered by the same `fx.js` engine. Changes apply instantly to open Lovable tabs via `chrome.storage.onChanged`.

## Files
`manifest.json`, `glass.css`, `shared.js`, `fx.js`, `content.js`, popup: `index.html` + `style.css` + `script.js`, `icons/`.

## Install
1. `chrome://extensions` → Developer mode → **Load unpacked** → select this folder.
2. After every change click **Reload** on the extension and hard-refresh Lovable (Ctrl+Shift+R).

See the [Setup Guides](../../../setup/README.md) for full step-by-step instructions.

## Compatibility
- Chrome / Edge / Brave / Arc / Opera (Chromium, Manifest V3).
- Matches `https://lovable.dev/*` and `https://*.lovable.dev/*`.
- Permissions: `storage` (settings) and `activeTab` only.

## Troubleshooting
Lovable updates its UI regularly. If a surface is not themed: F12 → inspect it → find an ARIA role, a `data-*` attribute or a `bg-*` utility class and add it to the matching `:is(...)` list in `glass.css`. If the page feels slow, set Quality to Low, lower Blur, or turn off Background lights.
