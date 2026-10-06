# ChatGPT DARK GPT (v1.1.1)

**Style:** deep-black glass surfaces, layered crimson accents, red ambient glow, red ChatGPT-style identity. Dark only. Visual styling only: no messages are read, nothing is sent anywhere.

## Architecture
| File | Role |
|---|---|
| dark-gpt.css | everything scoped to `html[data-cug-darkgpt]`; re-maps ChatGPT's own design tokens, glass on leaf surfaces only |
| content.js | writes CSS variables, owns the WebGL background, the pointer light, and the headline lifecycle |
| fx.js | WebGL ambient glow (caustics / rays / neon), paused when hidden |
| textfx.js | particle text engine + DOM adapter for the headline |
| shared.js | settings, validation, storage (`darkGptSettings`) |
| index.html / style.css / script.js | popup with live preview |

## Particle headline
- **Detection:** the `h1` inside an element whose style contains `vt-splash-screen-headline` (ChatGPT's greeting wrapper). A throttled `MutationObserver` on `<html>` attaches/detaches; `getElementsByTagName("h1")` + `closest()` keeps the check cheap even during streaming.
- **Layout:** the real text is measured per character (Range rects) and regrouped into lines, so wrapping, font, size and letter-spacing are reproduced exactly. Transform scale of the host (entrance animation) is compensated.
- **Placement:** a canvas is appended *inside* the h1; it inherits position, opacity and transforms. Its overhang is dynamic (110 px + 1.45 x effect radius horizontally, 80 px + 1.25 x radius vertically, plus the extra width of scaled text) and its edges are feathered by a CSS mask, so glow never ends in a visible rectangle. The text itself is `color: transparent` from the first frame (CSS, structural selector), so there is no flash of plain text.
- **Sampling:** text is rendered to an offscreen canvas and sampled on a jittered grid into typed arrays (cap 6500 particles).
- **Physics:** spring to home + damping; pointer force with smooth falloff (repel / attract / swirl), a "wake" from pointer velocity, click bursts.
- **Cost:** ~6 `fillStyle` changes per frame, no shadowBlur; 30 fps idle, 60 fps near the pointer; stops when hidden or off-screen.
- **Accessibility:** text stays in the DOM; forced-colors mode shows plain text; `prefers-reduced-motion` removes the assemble animation and the idle sweep.

## Pointer light
A fixed `#cug-glow` element moved with `transform` (eased in a rAF loop only while it is catching up). It deliberately does not use a root CSS custom property, which would invalidate styles for the whole page on every mouse move.

## Troubleshooting
- Headline not turning into particles: open DevTools, inspect the greeting and check that an ancestor has `view-transition-name: var(--vt-splash-screen-headline)` in its inline style; if OpenAI renamed it, update `findHeadline()` in content.js and the two selectors in section 14 of dark-gpt.css.
- A panel looks unstyled: ChatGPT renamed a class; add a narrow selector to the matching section of dark-gpt.css.
- Heavy page: Background quality → Low, lower particle density.
