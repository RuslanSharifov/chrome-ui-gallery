# Gemini Glassmorphism UI

## Design name
Gemini Glassmorphism

## Platform
Google Gemini Web App (gemini.google.com)

## Design style
Glassmorphism with adaptive light/dark theming, atmospheric WebGL lighting, restrained motion, and targeted surface-level overrides.

## Technology
- Chrome Extension Manifest V3
- HTML5
- CSS3
- Vanilla JavaScript
- WebGL fragment shader for optional ambient lighting
- chrome.storage.local for persistent settings
- Chrome content scripts

## Purpose
This extension restyles the existing Gemini web interface without replacing Gemini, opening a second Gemini window, sending prompts, calling an external API, or changing Gemini conversation logic. It is a visual layer only.

The implementation follows the architecture of the ChatGPT Glassmorphism design in this repository, but the selectors and theme detection are Gemini-specific. Gemini is a responsive web application with a collapsible navigation shell, conversation surface, composer, menus, dialogs, Gems, settings, and tool-related panels. The extension therefore styles surfaces instead of assuming one fixed page layout.

## Gemini-specific research notes
- Target: https://gemini.google.com/*
- Gemini supports light and dark themes; Google's help documentation says the web app normally follows the device color scheme and allows a manual dark-theme switch.
- Public Gemini customization projects show selectors such as .conversation-container, .input-area-container, .user-query-bubble-with-background, user-query, .user-query-content, message-content, and older sidebar shell elements. These are compatibility hints, not permanent API contracts.
- The CSS uses layered selector lists and forgiving :is() blocks rather than one brittle selector.
- The extension does not depend on Gemini internal APIs or private network endpoints.

## Main UI areas covered
1. Global page background and ambient lighting.
2. Left navigation/sidebar and chat history.
3. Top and utility controls.
4. Main conversation container.
5. User query bubbles.
6. Gemini model response content.
7. Composer/input area and attachment controls.
8. Code blocks, tables, lists, links, citations, and markdown content.
9. Menus, popovers, tooltips, dialogs, and settings surfaces.
10. Gems and feature cards.
11. Tool, research, loading, and status surfaces where compatible selectors exist.
12. Scrollbars, selection, focus rings, and reduced-motion behavior.

## Popup controls
- Master enable/disable switch.
- Presets: Underwater, Cyberpunk, Aurora, Calm, Minimal.
- Lighting palette, intensity, scale, speed, caustics, rays, neon glow, cursor glow, and quality.
- Glass accent, blur, opacity, chat-area veil, saturation, edge shine, and roundness.
- Optional 3D hover for chat rows.
- Optional draggable dialogs.
- Reset to defaults.
- Repository link.

## Files
- manifest.json — Manifest V3 registration for gemini.google.com.
- glass.css — Gemini-specific glassmorphism and theme token overrides.
- shared.js — Defaults, palettes, presets, validation, and storage helpers.
- fx.js — Optional WebGL ambient-light renderer with CSS fallback.
- content.js — Theme detection, settings synchronization, background lifecycle, and dialog dragging.
- index.html — Extension popup markup.
- style.css — Popup visual system.
- script.js — Popup controls and live preview.

## CMD setup
```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
cd gemini\glassmorphism\gemini-glassmorphism
```

## Install as an unpacked Chrome extension
1. Open Chrome.
2. Go to chrome://extensions.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select gemini\glassmorphism\gemini-glassmorphism.
6. Open or refresh https://gemini.google.com/.
7. Click the extension toolbar button.
8. Use the master switch to enable or disable the visual layer.

## Development loop
1. Edit glass.css, content.js, shared.js, or popup files.
2. Return to chrome://extensions.
3. Click Reload on the extension.
4. Refresh the Gemini tab.
5. If a surface is not styled, inspect the current DOM before adding a selector. Prefer data attributes, ARIA roles, semantic custom elements, and stable product structure over generated class names.

## Troubleshooting
### Manifest missing or unreadable
Load the folder that directly contains manifest.json. Do not select gemini, glassmorphism, or a parent folder.

### Extension loads but Gemini is unchanged
Reload the extension and hard-refresh Gemini. Confirm the URL starts with https://gemini.google.com/ and that the master switch is enabled.

### One Gemini screen is not themed
Gemini can change its DOM between releases. Inspect that screen and add a narrow selector to the relevant section of glass.css. Avoid universal body * rules.

### Performance is poor
Turn off Dynamic light background, reduce Blur, or select Low quality. The WebGL layer renders at reduced resolution and pauses while the tab is hidden.

### Light/dark colours are wrong
Gemini supports both light and dark themes. content.js checks theme-related classes and attributes and falls back to the system preference. If Gemini changes its theme marker, update detectMode() rather than duplicating theme rules throughout the CSS.

## Safe extension boundaries
- Does not send or modify prompts.
- Does not call Gemini or Google APIs.
- Does not scrape conversation content for external services.
- Does not open a replacement chat window.
- Does not change account settings.
- Does not modify Gemini responses.
- Does not inject third-party remote scripts.

## Sources and research
- Google Gemini Help — Use Gemini Apps: https://support.google.com/gemini/answer/13275745
- Google Gemini Help — Use Dark theme in Gemini Apps: https://support.google.com/gemini/answer/13542227
- Google Gemini Help — Create and use Gems: https://support.google.com/gemini/answer/15146780
- Chrome for Developers — Manifest V3 migration: https://developer.chrome.com/docs/extensions/develop/migrate
- Chrome for Developers — Scripting API: https://developer.chrome.com/docs/extensions/reference/api/scripting
- Public Gemini UI customizer research was used only to identify compatibility patterns; selectors remain defensive because Gemini DOM is not a stable public API.