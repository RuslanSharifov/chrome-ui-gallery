# ChatGPT Glassmorphism UI

## Design name

ChatGPT Glassmorphism UI

## Platform

ChatGPT

## Design style

Glassmorphism

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Chrome Extension Manifest V3
- Chrome Storage API
- Chrome Tabs API
- Content script CSS injection
- CSS `backdrop-filter`

## Purpose

This Chrome extension changes the existing ChatGPT website UI into a glassmorphism-style interface.

It is a **UI-only extension**:

- It does not open a separate ChatGPT window.
- It does not create a prompt tool inside ChatGPT.
- It does not send prompts.
- It does not call the OpenAI API.
- It only applies and removes CSS styling on the existing ChatGPT page.

The extension can be enabled or disabled from the Chrome toolbar extension popup.

## Files

- [Design folder](./)
- [HTML popup](./index.html)
- [CSS](./style.css)
- [JavaScript](./script.js)
- [Content script](./content.js)
- [Manifest](./manifest.json)
- [Documentation](./design.md)

## How it works

1. Chrome loads `content.js` on `chatgpt.com` and `chat.openai.com`.
2. The content script reads the saved `glassEnabled` setting.
3. When enabled, it adds a dedicated style element to the ChatGPT page.
4. The style targets ChatGPT surfaces, panels, composer areas, buttons, dialogs, and backgrounds.
5. The glass effect uses translucent backgrounds, borders, shadows, saturation, and `backdrop-filter: blur(...)`.
6. When disabled, the injected style is removed.
7. The setting is stored with Chrome Storage, so it remains available after reopening Chrome.

## Chrome toolbar popup

Click the extension icon in the Chrome toolbar to open a small control panel.

The popup contains:

- Glass effect ON/OFF switch
- Current activation status
- Repository link
- Creator GitHub profile link

The popup is only a control panel. It does **not** open ChatGPT or replace the ChatGPT page.

## Install from Chrome Extensions

### Step 1 — Get the project

Clone the repository:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

### Step 2 — Open Chrome Extensions

Open:

```text
chrome://extensions/
```

Turn on **Developer mode**.

### Step 3 — Load the unpacked extension

Click **Load unpacked**.

Select this exact folder:

```text
chrome-ui-gallery
└── chatgpt
    └── glassmorphism
        └── ai-prompt-tool
```

Do not select `index.html` itself.

The selected folder must contain:

```text
ai-prompt-tool/
├── manifest.json
├── index.html
├── style.css
├── script.js
├── content.js
└── design.md
```

### Step 4 — Open or reload ChatGPT

Open `https://chatgpt.com/`.

If ChatGPT was already open before the extension was loaded or updated, reload the ChatGPT tab.

### Step 5 — Test the effect

Click the extension icon in Chrome.

Turn **Glass effect** on.

The existing ChatGPT page should change visually without opening a new ChatGPT window.

Turn it off to remove the glassmorphism CSS.

### Step 6 — After editing extension files

When you change extension files:

1. Return to `chrome://extensions/`.
2. Find **ChatGPT Glassmorphism UI**.
3. Click **Reload**.
4. Reload the ChatGPT tab.

## Setup from CMD

If you want to create the folder structure locally:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
mkdir chatgpt\glassmorphism\ai-prompt-tool
cd chatgpt\glassmorphism\ai-prompt-tool
```

If the repository is already cloned, do not clone it again. Run:

```cmd
cd /d "C:\path\to\chrome-ui-gallery"
git pull
```

Then load the `ai-prompt-tool` folder from Chrome Extensions.

## Local development checklist

Use this checklist when developing the extension:

1. Confirm `manifest.json` exists.
2. Confirm `content.js` exists.
3. Confirm the manifest matches ChatGPT domains.
4. Load the folder with **Load unpacked**.
5. Reload the extension after code changes.
6. Reload the ChatGPT tab after content-script changes.
7. Open DevTools with `F12` or `Ctrl + Shift + I`.
8. Check **Console** for extension errors.
9. Check **Elements** to confirm the injected style element exists.
10. Toggle the extension off and confirm that the injected style is removed.

## Suitable use cases

- Glassmorphism ChatGPT themes
- Chrome UI experiments
- Browser UI customization
- Visual design prototypes
- CSS-only interface experiments
- Design system exploration

## Important note

ChatGPT can change its internal HTML structure or CSS class names. The content script therefore uses semantic attributes, role selectors, and class-pattern selectors where possible. If ChatGPT changes its DOM, the selectors may need to be updated.
