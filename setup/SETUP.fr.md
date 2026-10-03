# Chrome UI Gallery — Installation rapide

Ce guide explique comment cloner le dépôt depuis CMD, ouvrir un design localement, modifier les fichiers et envoyer les changements vers GitHub.

## 1. Cloner le dépôt
```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Ouvrir le dossier du design
```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Modifier les fichiers
Modifiez `index.html`, `style.css`, `script.js` et `design.md` avec votre éditeur préféré.

## 4. Tester localement
Ouvrez `index.html` dans votre navigateur.

## 5. Envoyer les changements vers GitHub
```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Ajouter un nouveau design
Créez un dossier séparé et ajoutez ses liens Code et Documentation dans `chatgpt/README.md`.