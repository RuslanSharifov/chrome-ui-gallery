# Chrome UI Gallery — Schnelle Einrichtung

Diese Anleitung erklärt, wie du das Repository über CMD klonst, ein Design lokal öffnest, Dateien bearbeitest und Änderungen zu GitHub pushst.

## 1. Repository klonen
```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Zum Design-Ordner wechseln
```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Dateien bearbeiten
Bearbeite `index.html`, `style.css`, `script.js` und `design.md` mit deinem bevorzugten Editor.

## 4. Lokal testen
Öffne `index.html` im Browser.

## 5. Änderungen zu GitHub pushen
```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Neues Design hinzufügen
Erstelle einen separaten Ordner und füge die Code- und Dokumentationslinks in `chatgpt/README.md` hinzu.