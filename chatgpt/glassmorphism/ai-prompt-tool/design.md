# ChatGPT Glassmorphism UI

## Design name

ChatGPT Glassmorphism UI

## Platform

ChatGPT

## Design style

Glassmorphism

## Technologies

- Chrome Extension Manifest V3
- Content script CSS injection
- Chrome Storage API
- Chrome Tabs API
- HTML5
- CSS3
- Vanilla JavaScript
- CSS backdrop-filter
- CSS custom properties
- MutationObserver
- Pointer Events

## Purpose

This extension restyles the **existing ChatGPT website**. It does not open a second ChatGPT window, create a replacement chat client, send prompts, or call the OpenAI API.

The extension is designed as a visual theme layer:

- Deep glass surfaces
- Readable adaptive text colors
- Amber/gold navigation accents
- Glass sidebar and navigation hierarchy
- Glass composer and prompt input
- Distinct project labels
- Glass settings, upgrade, plugin, menu, and dialog surfaces
- Light/dark-compatible glass tokens
- Subtle ambient background motion
- Small 3D hover motion for chat rows
- Optional dragging of supported modal/dialog surfaces from their upper area

## UI coverage

The theme targets the major interface areas that can appear in current ChatGPT builds:

- Chat / Work navigation
- New chat and primary navigation
- Images
- Library
- Scheduled
- Projects
- Codex
- More/customization areas
- Sidebar sections and headings
- Chat titles and project labels
- Upgrade / plan controls
- Main conversation background
- Composer and prompt input
- User and assistant messages
- Menus and dropdowns
- Settings windows
- Upgrade/plan dialogs
- Plugin/customization dialogs
- Code blocks
- Scrollbars

ChatGPT changes its DOM over time, so the stylesheet intentionally uses multiple semantic, ARIA, data-testid, data-attribute, token, and class-pattern selectors instead of depending on one generated CSS class.

## Interaction design

### Chat title hover

Sidebar chat rows use a restrained 3D micro-interaction:

- Slight scale increase
- Small horizontal lift
- Small perspective rotation
- Soft glass highlight
- Gold-tinted edge

The motion is intentionally subtle so the sidebar remains usable.

### New chat background

The empty/new-chat state keeps the actual ChatGPT content intact but adds:

- Layered translucent surfaces
- Radial ambient gradients
- A very slow background animation
- Depth between foreground and background surfaces

### Dialog positioning

When a supported dialog exposes a recognizable upper/header area, the extension makes that area a drag handle. Dragging changes the dialog's fixed screen position without changing the underlying ChatGPT functionality.

If ChatGPT uses a different dialog structure in a future release, that dialog may remain in its native position until its selector is updated.

## Theme behavior

The extension uses adaptive glass tokens.

Dark mode uses:

- Deep navy/black glass
- White/blue-gray text
- Purple/cyan ambient highlights
- Amber/gold navigation accents

Light mode uses:

- Frosted white surfaces
- Dark readable text
- Muted gray secondary text
- Gold and purple accents

The extension does not force ChatGPT's application theme. It overlays its glass visual system on the current page theme.

## Files

- [Design folder](./)
- [HTML popup](./index.html)
- [CSS popup](./style.css)
- [Popup JavaScript](./script.js)
- [ChatGPT content script](./content.js)
- [Manifest](./manifest.json)
- [Documentation](./design.md)

## Chrome installation

1. Update the repository:
```cmd
cd /d "C:\path\to\chrome-ui-gallery"
git pull
```

2. Open:
```text
chrome://extensions/
```

3. Enable **Developer mode**.

4. Click **Load unpacked**.

5. Select exactly:
```text
chrome-ui-gallery
└── chatgpt
    └── glassmorphism
        └── ai-prompt-tool
```

6. Click **Reload** on the extension after future code updates.

7. Reload the open ChatGPT tab with **Ctrl + Shift + R**.

8. Open the extension popup and set **Glass effect** to ON.

## Troubleshooting

If a particular ChatGPT element remains unchanged:

1. Reload the extension at `chrome://extensions/`.
2. Hard-refresh ChatGPT.
3. Open DevTools with `F12`.
4. Inspect the unchanged element in **Elements**.
5. Check **Console** for content-script errors.
6. Check whether the element has a new semantic/data-testid/ARIA hook.
7. Update `content.js` selectors instead of relying on a generated utility class.

## Important compatibility note

ChatGPT is a live web application and its DOM, labels, sidebar organization, and feature availability can change. Current product changes have moved or regrouped areas such as Projects, Scheduled, Library, Images, Customize/Plugins, Work, and Codex in different releases. The extension therefore uses layered fallbacks rather than assuming one permanent layout.

## Suitable use cases

- Personal ChatGPT visual themes
- Glassmorphism experiments
- Chrome extension UI research
- Browser interface customization
- CSS design prototyping
- Accessibility/readability experiments
- Design system exploration
