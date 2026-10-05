# QA & Hardening Notes — v4.1.0

This release preserves the original visual implementation and adds only compatibility, runtime-hardening, and packaging improvements.

## Verified
- Manifest V3 structure retained.
- Existing `glass.css`, `style.css`, and effect selectors are preserved; the new layer is appended.
- Existing README/DESIGN/FEATURES/SETUP documentation was reviewed before implementation.
- Missing icon assets referenced by `manifest.json` were added at 16/32/48/128px.
- Proximity sensitivity now has a direct runtime effect in the additive depth layer.
- Card lift now contributes positive Z translation in the additive depth layer.
- Reduced-motion preference is detected and disables additive transforms/animations.
- Mutation-driven card cache invalidation reduces repeated selector work during GitHub navigation.
- Stored numeric settings are clamped to their documented UI ranges before persistence/broadcast.
- Storage failures no longer break the popup flow.

## Research basis
Chrome's current Manifest V3 documentation confirms that content scripts are a supported way to modify page DOM/CSS and that extension storage is the appropriate persistent storage API. The implementation keeps the existing local-storage approach and does not add remote code or new host access.

## Manual smoke test
1. Load the folder with `chrome://extensions/` → Developer mode → Load unpacked.
2. Open `https://github.com/`.
3. Open the popup and switch themes/tabs.
4. Change proximity distance/sensitivity and card lift.
5. Toggle Matrix and reduced-motion at OS/browser level.
6. Navigate between repository pages and confirm settings persist.

## Known limitation
GitHub is a frequently changing application. Selectors are intentionally broad and conservative, but future GitHub DOM changes can require selector additions.
