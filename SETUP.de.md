# Chrome UI Gallery — Schnelle Einrichtung

Diese Anleitung erklärt, wie du das Repository über CMD klonst, ein Design lokal öffnest, Dateien bearbeitest und Änderungen zu GitHub pushst.

## 1. Repository klonen

CMD öffnen:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Zum Design-Ordner wechseln

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Dateien bearbeiten

Der Ordner enthält:

```text
index.html
style.css
script.js
design.md
```

Bearbeite die Dateien mit deinem bevorzugten Code-Editor.

## 4. Lokal testen

Öffne `index.html` im Browser.

## 5. Änderungen zu GitHub pushen

Zur Repository-Wurzel zurückkehren:

```cmd
cd ..\\..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Neues Design hinzufügen

Überschreibe kein vorhandenes Design. Erstelle einen separaten Ordner:

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Füge danach die Code- und Dokumentationslinks für das neue Design zu `chatgpt/README.md` hinzu.

## Repository-Struktur

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
