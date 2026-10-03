# Chrome UI Gallery — Vollständige Einrichtungsanleitung

Diese Anleitung beschreibt das Klonen des Repositories, die Navigation, das lokale Laden von Manifest-V3-Chrome-Erweiterungen, Tests, Debugging und das Hinzufügen neuer Designs.

## 1. Voraussetzungen

- Windows CMD oder ein anderes Terminal.
- Git.
- Google Chrome.
- Ein Code-Editor.
- Ein Google-Konto, falls die Zielanwendung dies benötigt.

Die aktuellen Vanilla-HTML/CSS/JavaScript-Designs benötigen kein Node.js und keinen Build-Schritt.

## 2. Repository klonen

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Navigation verstehen

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> Code-Dateien
```

Aktuelle Beispiele:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Design öffnen

Für Gemini:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

Bei einer Chrome-Erweiterung muss `manifest.json` direkt in diesem Ordner liegen.

## 5. Chrome-Erweiterung laden

1. Chrome öffnen.
2. `chrome://extensions/` öffnen.
3. **Developer mode** aktivieren.
4. **Load unpacked** wählen.
5. Den Ordner auswählen, der direkt `manifest.json` enthält.
6. Nicht den Repository-Root oder einen übergeordneten Style-Ordner auswählen.
7. Zielseite öffnen.
8. Falls vorhanden, das Extension-Popup über die Toolbar öffnen.

## 6. Änderungen testen

Nach CSS- oder JavaScript-Änderungen:

1. Datei speichern.
2. Zu `chrome://extensions/` wechseln.
3. **Reload** der Erweiterung klicken.
4. Zielseite aktualisieren.
5. Bei Bedarf `Ctrl+Shift+R` verwenden.

## 7. Manifest-Fehler

Bei **Manifest file is missing or unreadable** muss der ausgewählte Ordner direkt `manifest.json` enthalten.

Für Gemini:

```text
gemini\glassmorphism\gemini-glassmorphism\manifest.json
```

## 8. Selektoren debuggen

AI-Webanwendungen ändern ihr DOM regelmäßig. Keine globalen Regeln wie `body *` verwenden, um ein lokales Problem zu lösen.

Mit F12:

- exaktes Element prüfen;
- semantische Elemente suchen;
- ARIA und data attributes prüfen;
- stabile Container bevorzugen;
- gezielte Selektoren hinzufügen;
- Light und Dark testen.

Reihenfolge: semantisches Element → data attribute/testid → ARIA → stabiler Container → Klasse als Fallback.

## 9. Theme-Test

Gemini unterstützt helle und dunkle Themes. Prüfe Hintergrund, Sidebar, Chatverlauf, Benutzerfragen, Antworten, Composer, Buttons, Icons, Menüs, Dialoge, Code, Tabellen und Focus-Zustände.

## 10. Performance

Bei WebGL-Effekten Low/Medium/High sowie ON/OFF testen. Außerdem sichtbare und versteckte Tabs sowie Reduced Motion prüfen. Immer einen Fallback für fehlendes WebGL oder backdrop-filter vorsehen.

## 11. Neues Design

Bestehende Designs niemals überschreiben.

```cmd
mkdir gemini\glassmorphism\new-design
```

Empfohlene Struktur:

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

Danach die relativen Links in den Plattform- und Style-README-Dateien ergänzen.

## 12. Dokumentation

Jedes `design.md` muss Name, Plattform, Stil, Technologien, Zweck, Architektur, Dateien, Installation, CMD-Workflow, Fehlerbehebung, Grenzen und Kompatibilität dokumentieren.

`design.md` bleibt ausschließlich auf Englisch.

## 13. Git

```cmd
git status
git diff
git add .
git commit -m "Add Gemini glassmorphism design"
git push origin main
```

Vor dem Push:

```cmd
git diff --check
```

## 14. Aktuelle Einstiegspunkte

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

Gemini URL: `https://gemini.google.com/`.
