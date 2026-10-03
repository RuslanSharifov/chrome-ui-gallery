# Chrome UI Gallery — Quick Setup

Bu fayl repository-ni CMD-dən götürmək, design-i lokalda açmaq və dəyişiklikləri GitHub-a göndərmək üçün qısa addım-addım guide-dır.

## 1. Repository-ni clone et

CMD açın:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Design folder-ə keç

```cmd
cd chatgpt\glassmorphism\ai-prompt-tool
```

## 3. Faylları dəyiş

Bu folder-də:

```text
index.html
style.css
script.js
design.md
```

fayllarını istədiyiniz editor ilə dəyişə bilərsiniz.

## 4. Lokal yoxla

``index.html`` faylını browser-də açın.

## 5. GitHub-a göndər

Repository root-a qayıdın:

```cmd
cd ..\..\..\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Yeni design əlavə etmək

Yeni design üçün mövcud folder-in üzərinə yazmayın. Ayrı folder yaradın:

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Sonra `chatgpt/README.md` daxilində həmin design üçün Code və Documentation linklərini əlavə edin.

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
