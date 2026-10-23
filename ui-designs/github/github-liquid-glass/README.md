# GitHub Liquid Glass (v1.0.0)

Install: chrome://extensions → Developer mode → Load unpacked → select THIS folder (the one containing manifest.json) → reload github.com.

Settings: toolbar icon (popup) or "Full page ↗" (wide settings tab). Click any part in the live preview to jump to its settings.
- Glass style: Frosted / Liquid / Clear liquid, accent, color mode, global transparency, blur, color boost, brightness, shadow depth.
- Liquid refraction: edge refraction, chromatic dispersion, glass edge thickness, specular highlight, edge light, bouncy hover.
- Background: Matrix rain, Contribution grid, Git graph, Aurora, Stars, Gradient mesh + color theme, intensity, speed, density, soften, cursor reaction.
- Effect options: Matrix glyphs/size/trail/lead glow · grid square size/gap/wave · branch lanes · shooting stars.
- 12 independent parts of GitHub (page veil, header, tabs, sidebars, cards, code, README, conversation, menus, dialogs, controls, footer):
  each has Glass on/off, transparency, blur, corner radius.
- 7 presets.

Notes: GitHub's DOM is not a public API; if a surface is missed, add its selector to the matching zone in glass.css.
Liquid edge refraction is an SVG backdrop-filter (Chrome/Edge); elsewhere blur + specular edges remain.
Matches: github.com and gist.github.com. Visual styling only; no network access, no data collected.
