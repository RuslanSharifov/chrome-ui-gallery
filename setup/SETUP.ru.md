# Chrome UI Gallery — Быстрая установка

Это руководство объясняет, как клонировать репозиторий через CMD, открыть дизайн локально, изменить файлы и отправить изменения в GitHub.

## 1. Клонировать репозиторий
```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Перейти в папку дизайна
```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Изменить файлы
Измените `index.html`, `style.css`, `script.js` и `design.md` в удобном редакторе.

## 4. Проверить локально
Откройте `index.html` в браузере.

## 5. Отправить изменения в GitHub
```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Добавить новый дизайн
Создайте отдельную папку и добавьте ссылки на код и документацию в `chatgpt/README.md`.