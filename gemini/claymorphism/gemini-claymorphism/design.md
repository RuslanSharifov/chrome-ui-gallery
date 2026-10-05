# Gemini Claymorphism UI (v1.1)

Chrome MV3 extension that restyles gemini.google.com with soft clay surfaces, animated 3D clay clouds, a weather system and an adjustable clay-to-glass blend. Visual styling only: no prompts are read or sent, no API calls, no remote assets.

## Files
| File | Role |
|---|---|
| manifest.json | MV3 registration, icons |
| shared.js | defaults, palettes, weather table, presets, `normalize`, `resolve(settings, geminiDark)` |
| weather.js | 2D canvas: rain, snow, stars, shooting stars, lightning bolts (+ flash hook) |
| clouds.js / clouds.css | scene builder: sky, sun/moon, 3D clouds, fog, canvas, flash |
| content.js | writes CSS variables, owns the scene, watches theme + storage |
| clay.css | Gemini selectors: sidebar, composer, cards, menus/dialogs, code |
| index.html / style.css / script.js | popup (presets + accordion, live preview) |

## How clay becomes glass
Each area (sidebar, composer, menus & dialogs, cards) has a transparency `t` (0..1) from the Glass section:
- fill alpha = base × (1 − t) + 0.07 × t
- offset shadows scale by (1 − 0.75 t); the light rim grows with t × "Edge shine"
- `backdrop-filter: blur(Glass blur)` on every surface

Presets: Clay (all 0), Clay + Glass (sidebar 45 / menus 55 / composer 35 / cards 30), Glass (80 / 85 / 70 / 62).

## Weather
`clear`, `cloudy`, `rain`, `storm`, `snow`, `fog`, `night`. Choosing one applies recommended cloud amount/opacity; every slider stays editable. Cloud colours follow the weather (tone: Auto) and UI colour mode "Auto" switches to the dark clay UI for Night and Storm.

Lightning: at most ~2 flashes per second, soft low-contrast flash; set Lightning to 0 to disable. Under `prefers-reduced-motion` there is no lightning and precipitation is a still frame.

## Theme logic
UI colour mode: **Auto** (palette + weather decide), **Follow Gemini** (reads Gemini's light/dark marker), **Light**, **Dark**. Light palettes get a derived dark variant automatically.

## Install
1. `chrome://extensions` → Developer mode → Load unpacked → select the folder with manifest.json.
2. Open/refresh https://gemini.google.com/ and click the toolbar icon.
After editing files: Reload on the extensions page, then refresh Gemini.

## Troubleshooting
- A panel is not styled: Gemini renames internals; inspect it and add a narrow selector to the matching group in clay.css (sections 3-5).
- Heavy page: lower Effects quality, Weather strength or Cloud amount.
- Text hard to read on a busy sky: raise Chat area tint or switch Text halo on.
