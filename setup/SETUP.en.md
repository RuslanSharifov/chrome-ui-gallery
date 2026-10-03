# Chrome UI Gallery — Complete Setup Guide

This guide explains how to clone the repository, understand its navigation, open a design, install a Manifest V3 Chrome extension, test UI changes, debug selector problems, create a new design, and optionally publish changes with Git.

## 1. Requirements

- Windows CMD or another terminal.
- Git.
- Google Chrome.
- A code editor.
- A Google account if the target design requires a signed-in web app.

No Node.js or build step is required for the current vanilla HTML/CSS/JavaScript designs.

## 2. Clone the repository

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Understand the navigation

Use this path:

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> code files
```

Current examples:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Open a design

For Gemini:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

The folder must contain `manifest.json` when it is a Chrome extension.

For ChatGPT:

```cmd
cd chatgpt\glassmorphism\ai-prompt-tool
dir
```

## 5. Install a Chrome extension locally

1. Open Chrome.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the design folder that directly contains `manifest.json`.
6. Do not select the repository root or a parent style folder.
7. Open the target website.
8. If the extension has a popup, open it from the Chrome toolbar.

## 6. Test a change

After editing a CSS or JavaScript file:

1. Save the file.
2. Return to `chrome://extensions`.
3. Click **Reload** on the extension.
4. Refresh the target web page.
5. For stubborn cached UI, use a hard refresh with `Ctrl+Shift+R`.

## 7. Debug a manifest error

If Chrome says **Manifest file is missing or unreadable**, verify the selected folder:

```text
gemini
└── glassmorphism
    └── gemini-glassmorphism
        ├── manifest.json   <-- select this folder
        ├── content.js
        ├── glass.css
        └── ...
```

If `manifest.json` is one level deeper than the folder you selected, Chrome will reject the folder.

## 8. Debug a UI selector

Modern AI web apps are frequently updated. Do not respond to a broken selector by styling every element on the page.

Instead:

1. Open DevTools with F12.
2. Inspect the exact element.
3. Look for semantic elements, ARIA roles, data attributes, stable custom elements, or meaningful containers.
4. Add a narrow selector to the appropriate CSS section.
5. Test light and dark themes.
6. Test desktop and narrow windows.
7. Check menus, dialogs, loading states, and empty states.

Prefer a selector strategy such as:

- semantic element;
- data-testid/data attribute;
- ARIA role;
- stable product container;
- class selector only as a fallback.

## 9. Theme testing

Gemini supports light and dark themes. Test both explicitly.

Check:

- page background;
- sidebar;
- chat history;
- user messages;
- model responses;
- composer;
- buttons and icons;
- menus;
- dialogs;
- code blocks;
- tables;
- focus states.

Do not assume that a class name used by one release will remain the same.

## 10. Performance testing

If a design uses animated backgrounds or WebGL:

- test with the effect enabled and disabled;
- test Low/Medium/High quality;
- test with the tab hidden and visible;
- test reduced-motion preferences;
- check GPU usage if the animation is complex.

A visual effect should degrade gracefully when WebGL or backdrop-filter is unavailable.

## 11. Create a new design

Never overwrite an existing design.

Example:

```cmd
mkdir gemini\glassmorphism\new-design
```

A complete extension design should normally contain:

```text
design-folder/
├── manifest.json
├── index.html
├── style.css
├── script.js
├── content.js
├── shared.js
├── glass.css
├── fx.js
└── design.md
```

Update the platform and style README files with relative links.

## 12. design.md requirements

Every design documentation file should explain:

- design name;
- platform;
- visual style;
- technologies;
- purpose;
- architecture;
- important UI areas;
- file responsibilities;
- installation;
- CMD setup;
- development workflow;
- troubleshooting;
- safe boundaries;
- compatibility or research notes.

Design documentation is English-only.

## 13. Optional Git workflow

Check changes:

```cmd
git status
git diff
```

Commit:

```cmd
git add .
git commit -m "Add Gemini glassmorphism design"
```

Push:

```cmd
git push origin main
```

## 14. Useful repository checks

Before pushing:

```cmd
git status
git diff --check
```

Confirm that:

- the design folder has its own `design.md`;
- README links use relative paths;
- no existing design was overwritten;
- the manifest points to files that actually exist;
- extension files contain no accidental local filesystem paths;
- remote scripts are not required unless explicitly intended.

## 15. Current design entry points

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

For Gemini, the target URL is `https://gemini.google.com/`.
