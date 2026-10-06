# Changelog

## 1.1.1
- **Particle text container no longer shows hard edges.** The canvas used a fixed 130x100 px overhang, so the red pointer light (radius up to 260 px) and the glow of hot particles were cut off at its border, which showed as a visible rectangle. Now:
  - the canvas overhang grows with the effect radius and the text size (a 200% headline no longer pokes out of its canvas)
  - the canvas edges are feathered with a soft CSS mask (`--cug-fx` / `--cug-fy`), so anything reaching the border fades out
  - the pointer light inside the canvas fades with a longer, smoother falloff

## 1.1.0

### New
- **Interactive particle headline** — ChatGPT's welcome text on a new chat ("Ready when you are." or whatever greeting ChatGPT shows) is painted as particles that react to the mouse:
  - mouse effect: **Repel**, **Attract** or **Swirl**; click = **burst**; a soft highlight sweeps across the text while idle
  - particles assemble left to right when the greeting appears or changes
  - settings: effect radius, strength, particle density, text size
  - the real text stays in the DOM (screen readers, selection), it is only painted transparent
- **Live preview** in the popup (WebGL background + the same particle engine) and collapsible sections.
- Settings: chat area tint, background quality (low / medium / high), 3D hover toggle, pointer light on/off.

### Fixed
- Particle text lifecycle: the old code polled forever with `setTimeout`, left a ghost canvas on screen after opening a chat, and stayed bound to a detached element after returning to a new chat. Now a throttled `MutationObserver` attaches/detaches it exactly when the headline exists; verified with rapid chat/new-chat switching, text changes, and disable/enable.
- The canvas now lives inside the headline, so it follows the entrance animation, view transitions, scrolling and sidebar open/close automatically (the old fixed canvas was positioned once).
- Performance: no per-particle `shadowBlur`/`arc`; typed arrays, ~6 colour buckets, 30 fps idle / 60 fps interacting, paused when hidden or off-screen.
- The pointer light only moved when the particle text had started. It is now its own element moved with `transform` (no root custom-property updates, so no document-wide style recalculation) and works on every page.
- Two cursor lights stacked (CSS + shader). The shader's cursor glow is off.
- "Background glow" also raised the dark veil of every surface (above ~60% the glow got *darker*). The slider now controls only the ambient light; the veil is a separate "Chat area tint".
- Popup had a background canvas but never drew into it; `fx.js` leaked its `resize` listener; wrong log prefix; ambient layer is built without `innerHTML`.
- Removed dead rules (`html::after` glow, drag handle, old particle selectors).

## 1.0.0
- Initial DARK GPT release.
