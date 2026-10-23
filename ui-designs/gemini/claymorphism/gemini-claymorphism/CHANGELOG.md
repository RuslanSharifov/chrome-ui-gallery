# Changelog

## 1.1.0

### New
- **Weather** — Sunny (clay sun with slow rays), Cloudy, Rain, Thunderstorm (rain + lightning bolts + sky flash), Snow, Fog, Night (stars, shooting stars, clay moon). Weather strength, wind (direction + speed), lightning frequency and sky tint are adjustable. Sky colours cross-fade smoothly.
- **Clay + Glass blend** — per-area transparency sliders (sidebar, input box, menus & dialogs, cards/bubbles/code), chat-area tint, glass blur and edge shine. One-click styles: Clay / Clay + Glass / Glass. As an area gets more transparent its pastel fill fades, offset clay shadows soften and a rim light appears.
- **Accordion popup** — Clouds, Weather, Glass, Clay and More sections open with a chevron; open state is remembered.
- **Cloud type** (Puffy / Flat / Wispy) and **cloud tone** (Auto / Bright / Neutral / Overcast / Stormy). Clouds follow the weather automatically.
- 8 complete presets (Cloudscape, Sunny day, Rainy, Thunderstorm, Snowfall, Starry night, Foggy, Calm), a Rose palette, UI colour mode (Auto / Follow Gemini / Light / Dark), effects quality, extension icons.

### Fixed
- Palette was ignored whenever Gemini was in dark mode (a CSS rule forced Dusk colours while clouds stayed light). The extension now owns its colours; "Follow Gemini" is an explicit option.
- The 3D depth slider did nothing (no `perspective`, and `filter` flattened the puffs). Depth now drives real Z travel of the clouds and the shadow length.
- Every `class` change on `<body>` rebuilt the whole scene; the observer now only reacts when the followed theme really changes.
- Composer: the same clay shadow was applied to container, `.input-area` and `.text-input-field` (triple frame). Now a single layer; Gemini's fade strips above the composer are neutralised.
- Nested shadows on code (block + inline + inner `<pre>`), global `button { background: transparent }`, global `svg { fill: currentColor }` (broke logos), and the global reduced-motion rule that froze Gemini's own spinners.
- Sidebar titles/logo/section headings unreadable over strong backgrounds (palette ink + optional text halo).
- The scene sits behind the UI (`z-index:-1`, transparent `<body>`) instead of on top of non-positioned content.

## 1.0.0
- Initial Gemini Claymorphism release.
