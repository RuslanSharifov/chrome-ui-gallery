# Chrome UI Gallery — Installation rapide

Ce guide explique comment cloner le dépôt depuis CMD, ouvrir un design localement, modifier les fichiers et envoyer les changements vers GitHub.

## 1. Cloner le dépôt

Ouvrez CMD :

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Ouvrir le dossier du design

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Modifier les fichiers

Le dossier contient :

```text
index.html
style.css
script.js
design.md
```

Modifiez ces fichiers avec votre éditeur de code préféré.

## 4. Tester localement

Ouvrez `index.html` dans votre navigateur.

## 5. Envoyer les changements vers GitHub

Revenez à la racine du dépôt :

```cmd
cd ..\\..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Ajouter un nouveau design

Ne remplacez pas un design existant. Créez un dossier séparé :

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Ajoutez ensuite les liens Code et Documentation du nouveau design dans `chatgpt/README.md`.

## Structure du dépôt

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
