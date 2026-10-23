# Changelog

## 1.2.0

### CSS (glass.css)
- **Composer shadow / white band** — removed the leftover `box-shadow` on `.input-area-container`, deleted the stray `[_nghost-ng-c…]` rule (hard-coded shadows + `position:absolute`) and the old white `.ql-editor` rules (they won on `:focus` and turned the field white). Fade gradients, glow and blur on the composer's wrappers/ancestors are cleared (section 6b).
- **Double frame** — `.input-area` inside `.input-area-container` no longer has its own border/blur; focus ring moved to the outer container.
- **Sidebar legibility** — chat titles, section headings and the account row are forced to a high-contrast colour with a soft dark text-shadow; the selected chat is a glass pill instead of Gemini's opaque white one (section 4b).

### Background (fx.js)
- **Cursor-driven waves** — concentric waves around the pointer, the caustic field is dragged along pointer motion, caustic lines brighten under the cursor.
- **Click ripples** — up to 3 expanding rings, 4 s lifetime.
- New settings: `mouseWave` (0-100) and `clickRipple`; both disabled under `prefers-reduced-motion`.

### Popup
- "Cursor waves" slider, "Ripples on click" switch, explicit **Save** button and a "Saved ✓" indicator (settings still auto-save).

## 1.1.0

### Packaging
- Added extension icons (16/32/48/128) and toolbar `default_icon`; `minimum_chrome_version` set to 111.

### CSS (glass.css)
- **Chat-area opacity slider did nothing** — `--gug-veil` was defined but never used. It now tints the main content area.
- **Panel-opacity slider only affected the sidebar** — composer, dialogs, code and cards used fixed alphas. All surfaces now derive from `--gug-alpha`.
- **Light mode ignored the Edge-shine slider** — sheen/edge are now computed from `--gug-shine` in both modes.
- **`bard-sidenav-content` was treated as the sidebar** — it is the main content area (`mat-sidenav-content`). Real sidebar targets: `bard-sidenav`, `mat-sidenav`, `.mat-drawer`.
- **Nested glass / double frames** — `.cdk-overlay-pane` wrappers, `.input-area` inside `.input-area-container`, nested code-block wrappers and sidebar inner containers each got their own blur + border. Only the visible outer surface is glass now; inner wrappers are transparent.
- **Over-broad selectors** — `[class*="gem"]`, `[class*="tool"]`, `[class*="code-block"]`, `main [class*="conversation"]` hit logos, toolbars and tooltips. Replaced by exact element/class selectors.
- **Composer buttons forced transparent** — broke the send button. Send button is excluded.
- **Inline-code style leaked into code blocks** — now scoped with `:not(pre code, …)`.
- **Scrollbars** — Chrome 121+ ignores `::-webkit-scrollbar` when `scrollbar-width/color` is set; standard properties are primary, webkit rules are an `@supports` fallback.
- **Reduced motion** — global `animation-duration: 0 !important` froze Gemini's own spinners; now only the extension's own animations are disabled.
- **3D hover** was only a 2px nudge; now a real perspective tilt. Undefined `--gug-r-sm` is defined and follows the Roundness slider.
- Added: modal scrim frosting, CSS-fallback blob drift, WebGL-mode blob cleanup (fixed violet/cyan blobs muddied Cyberpunk/Sunset).

### Scripts
- **content.js** — theme was read from `<html>` only; Gemini marks `<body>`. Body is now observed (attached as soon as it exists at `document_start`).
- **content.js** — re-enabling the theme left `data-gug-mode` unset (stale `mode` variable).
- **content.js** — ambient layer built with `createElement` instead of `innerHTML` (Trusted Types safe); Material dialogs are now draggable (drag target is `.mdc-dialog__surface`).
- **fx.js** — Caustics / Light rays / Neon glow sliders were dead (not in the shader); implemented.
- **fx.js** — mouse glow was offset on wide screens (missing aspect correction); fixed.
- **fx.js** — canvas buffer was reallocated every frame; now only on size change. Static scenes skip redraws.
- **fx.js** — `loseContext()` made the canvas permanently unusable, so toggling "Dynamic light background" off/on broke; resources are released without killing the context. `webglcontextlost` now falls back to CSS.
- **fx.js** — `highp` precision when available; honours `prefers-reduced-motion`.
- **Popup** — "Open gemini.google.com" notice was inverted (shown on Gemini, hidden elsewhere); accent picker now recolours the popup; the gradient fallback background was hidden behind an opaque `body`.
