# Chrome UI Gallery — Sürətli Qurulum

Bu guide repository-ni CMD-dən clone etmək, design-i lokalda açmaq, faylları dəyişmək və dəyişiklikləri GitHub-a göndərmək üçün addım-addım təlimatdır.

## 1. Repository-ni clone et

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Design folder-ə keç

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Faylları dəyiş

`index.html`, `style.css`, `script.js` və `design.md` fayllarını istədiyiniz editor ilə dəyişə bilərsiniz.

## 4. Lokal yoxla

`index.html` faylını browser-də açın.

## 5. GitHub-a göndər

```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Yeni design əlavə etmək

Mövcud design-in üzərinə yazmayın. Ayrı folder yaradın və `chatgpt/README.md` daxilində Code və Documentation linklərini əlavə edin.

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
