# Chrome UI Gallery — Quick Setup

This guide explains how to clone the repository from CMD, open a design locally, edit files, and push changes to GitHub.

## 1. Clone the repository

Open CMD:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Open the design folder

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Edit the files

The folder contains:

```text
index.html
style.css
script.js
design.md
```

Edit these files with your preferred code editor.

## 4. Test locally

Open `index.html` in your browser.

## 5. Push changes to GitHub

Return to the repository root:

```cmd
cd ..\\..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Add a new design

Do not overwrite an existing design. Create a separate folder:

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Then add Code and Documentation links for the new design to `chatgpt/README.md`.

## Repository structure

```text
chrome-ui-gallery/
├── README.md
├── SETUP.md
└── chatgpt/
    ├── README.md
    └── glassmorphism/
        └── ai-prompt-tool/
            ├── index.html
            ├── style.css
            ├── script.js
            └── design.md
```
