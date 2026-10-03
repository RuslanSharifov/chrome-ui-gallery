# Chrome UI Gallery — Быстрая установка

Это руководство объясняет, как клонировать репозиторий через CMD, открыть дизайн локально, изменить файлы и отправить изменения в GitHub.

## 1. Клонировать репозиторий

Откройте CMD:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Перейти в папку дизайна

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Изменить файлы

В папке находятся:

```text
index.html
style.css
script.js
design.md
```

Измените эти файлы в удобном для вас редакторе кода.

## 4. Проверить локально

Откройте `index.html` в браузере.

## 5. Отправить изменения в GitHub

Вернитесь в корень репозитория:

```cmd
cd ..\\..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Добавить новый дизайн

Не перезаписывайте существующий дизайн. Создайте отдельную папку:

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Затем добавьте ссылки на код и документацию нового дизайна в `chatgpt/README.md`.

## Структура репозитория

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
