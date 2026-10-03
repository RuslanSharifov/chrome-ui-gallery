# Chrome UI Gallery — Quick Setup

This guide explains how to clone the repository from CMD, open a design locally, edit files, and push changes to GitHub.

## 1. Clone the repository

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Open the design folder

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Edit the files

The folder contains `index.html`, `style.css`, `script.js`, and `design.md`.

## 4. Test locally

Open `index.html` in your browser.

## 5. Push changes to GitHub

```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Add a new design

Create a separate design folder and do not overwrite an existing design. Add its Code and Documentation links to `chatgpt/README.md`.

## Repository structure

```text
chrome-ui-gallery/
├── README.md
├── setup/
│   ├── README.md
│   ├── SETUP.az.md
│   ├── SETUP.en.md
│   ├── SETUP.fr.md
│   ├── SETUP.de.md
│   ├── SETUP.ru.md
│   └── SETUP.tr.md
└── chatgpt/
    ├── README.md
    └── glassmorphism/
        └── ai-prompt-tool/
            ├── index.html
            ├── style.css
            ├── script.js
            └── design.md
```
