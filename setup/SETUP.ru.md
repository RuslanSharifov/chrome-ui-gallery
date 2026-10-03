# Chrome UI Gallery — Полное руководство по установке

Это руководство объясняет клонирование репозитория, структуру навигации, локальную установку Chrome Manifest V3, тестирование, отладку селекторов и создание новых дизайнов.

## 1. Требования

- Windows CMD или другой терминал.
- Git.
- Google Chrome.
- Редактор кода.
- Google-аккаунт, если он нужен целевому сервису.

Текущие Vanilla HTML/CSS/JavaScript дизайны не требуют Node.js и отдельной сборки.

## 2. Клонировать репозиторий

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Понять навигацию

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> файлы кода
```

Текущие примеры:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Открыть design

Для Gemini:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

Для Chrome extension файл `manifest.json` должен находиться непосредственно в этой папке.

## 5. Загрузить extension в Chrome

1. Откройте Chrome.
2. Перейдите на `chrome://extensions/`.
3. Включите **Developer mode**.
4. Нажмите **Load unpacked**.
5. Выберите папку, в которой непосредственно находится `manifest.json`.
6. Не выбирайте корень repository или родительскую папку style.
7. Откройте целевой сайт.
8. Если есть popup, откройте его через toolbar.

## 6. Проверить изменения

После изменения CSS или JavaScript:

1. Сохраните файл.
2. Откройте `chrome://extensions/`.
3. Нажмите **Reload**.
4. Обновите целевую страницу.
5. При необходимости используйте `Ctrl+Shift+R`.

## 7. Ошибка manifest

Если Chrome показывает **Manifest file is missing or unreadable**, выбранная папка должна содержать `manifest.json` непосредственно.

Для Gemini:

```text
gemini\glassmorphism\gemini-glassmorphism\manifest.json
```

## 8. Отладка селекторов

AI-сайты часто меняют DOM. Не используйте универсальный `body *` для исправления одной области.

Через F12:

- проверьте конкретный элемент;
- ищите semantic elements;
- проверяйте ARIA и data attributes;
- выбирайте стабильный контейнер;
- добавляйте узкий selector;
- тестируйте светлую и тёмную темы.

Приоритет: semantic element → data attribute/testid → ARIA → стабильный контейнер → class как fallback.

## 9. Проверка тем

Gemini поддерживает светлую и тёмную темы. Проверяйте фон, sidebar, историю, пользовательские запросы, ответы, composer, кнопки, иконки, меню, диалоги, code blocks, таблицы и focus.

## 10. Производительность

Для WebGL проверяйте ON/OFF, Low/Medium/High, видимый и скрытый tab, а также Reduced Motion. Нужен fallback при недоступном WebGL или backdrop-filter.

## 11. Новый design

Не перезаписывайте существующий design.

```cmd
mkdir gemini\glassmorphism\new-design
```

Рекомендуемая структура:

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

После этого добавьте relative links в README платформы и style.

## 12. Документация

Каждый `design.md` должен содержать название, платформу, стиль, технологии, назначение, архитектуру, файлы, установку, CMD workflow, troubleshooting, ограничения и compatibility notes.

Файлы `design.md` должны быть только на английском.

## 13. Git

```cmd
git status
git diff
git add .
git commit -m "Add Gemini glassmorphism design"
git push origin main
```

Перед push:

```cmd
git diff --check
```

## 14. Текущие точки входа

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

URL Gemini: `https://gemini.google.com/`.
