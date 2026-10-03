# Chrome UI Gallery — Guide d'installation complet

Ce guide explique comment cloner le dépôt, comprendre sa structure, charger une extension Chrome Manifest V3, tester les changements, diagnostiquer les sélecteurs et créer un nouveau design.

## 1. Prérequis

- Windows CMD ou un terminal.
- Git.
- Google Chrome.
- Un éditeur de code.
- Un compte Google si le service ciblé l'exige.

Les designs HTML/CSS/JavaScript actuels ne nécessitent pas Node.js ni d'étape de build.

## 2. Cloner le dépôt

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Comprendre la navigation

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> fichiers de code
```

Exemples actuels:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Ouvrir un design

Pour Gemini:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

Pour une extension Chrome, `manifest.json` doit se trouver directement dans ce dossier.

## 5. Charger une extension Chrome

1. Ouvrez Chrome.
2. Allez sur `chrome://extensions/`.
3. Activez **Developer mode**.
4. Cliquez sur **Load unpacked**.
5. Sélectionnez le dossier qui contient directement `manifest.json`.
6. Ne sélectionnez pas la racine du dépôt ou le dossier style parent.
7. Ouvrez le site cible.
8. Utilisez le bouton de l'extension dans la barre d'outils si un popup existe.

## 6. Tester une modification

Après avoir modifié CSS ou JavaScript:

1. Enregistrez le fichier.
2. Retournez sur `chrome://extensions/`.
3. Cliquez sur **Reload**.
4. Actualisez la page cible.
5. Utilisez `Ctrl+Shift+R` si nécessaire.

## 7. Erreur de manifest

Si Chrome indique **Manifest file is missing or unreadable**, vérifiez que vous avez sélectionné:

```text
gemini\glassmorphism\gemini-glassmorphism\
```

et que `manifest.json` est directement à cet endroit.

## 8. Diagnostiquer les sélecteurs

Les interfaces IA changent souvent. N'utilisez pas de règle universelle comme `body *` pour résoudre un problème local.

Avec F12:

- inspectez l'élément exact;
- cherchez les éléments sémantiques;
- vérifiez ARIA et data attributes;
- recherchez un conteneur stable;
- ajoutez un sélecteur ciblé;
- testez les thèmes clair et sombre.

Préférence: élément sémantique → data attribute/testid → ARIA → conteneur stable → classe comme fallback.

## 9. Tester les thèmes

Gemini prend en charge les thèmes clair et sombre. Vérifiez:

- arrière-plan;
- barre latérale;
- historique;
- requêtes utilisateur;
- réponses;
- zone de saisie;
- boutons et icônes;
- menus;
- dialogs;
- code;
- tableaux;
- focus.

## 10. Performance

Pour les effets WebGL:

- testez ON/OFF;
- testez Low/Medium/High;
- testez onglet visible et caché;
- testez reduced motion;
- fournissez un fallback si WebGL ou backdrop-filter n'est pas disponible.

## 11. Créer un design

Ne remplacez jamais un design existant.

```cmd
mkdir gemini\glassmorphism\new-design
```

Structure recommandée:

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

Ajoutez ensuite les liens relatifs dans les README de la plateforme et du style.

## 12. Documentation

Chaque `design.md` doit expliquer le nom, la plateforme, le style, les technologies, le but, l'architecture, les fichiers, l'installation, le workflow CMD, le dépannage, les limites et les notes de compatibilité.

Les fichiers `design.md` sont en anglais uniquement.

## 13. Git

```cmd
git status
git diff
git add .
git commit -m "Add Gemini glassmorphism design"
git push origin main
```

Avant le push:

```cmd
git diff --check
```

## 14. Entrées actuelles

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

URL Gemini: `https://gemini.google.com/`.
