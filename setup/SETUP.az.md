# Chrome UI Gallery — Tam Qurulum Bələdçisi

Bu sənəd repository-ni CMD ilə clone etməkdən başlayaraq design strukturunu anlamağı, Manifest V3 Chrome extension-u lokal yükləməyi, dəyişiklikləri test etməyi, selector problemlərini araşdırmağı və yeni design əlavə etməyi izah edir.

## 1. Lazım olanlar

- Windows CMD və ya başqa terminal.
- Git.
- Google Chrome.
- Kod editoru.
- Hədəf web tətbiqi hesab tələb edirsə, uyğun Google hesabı.

Hazırkı vanilla HTML/CSS/JavaScript design-larında Node.js və build mərhələsi tələb olunmur.

## 2. Repository-ni clone et

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Navigation strukturunu başa düş

Axın belədir:

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> code faylları
```

Hazırkı nümunələr:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Design folder-ə keç

Gemini üçün:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

Chrome extension-dursa, bu folder-in içində birbaşa `manifest.json` olmalıdır.

## 5. Chrome extension-u lokal yüklə

1. Chrome aç.
2. `chrome://extensions/` səhifəsinə keç.
3. **Developer mode** aktiv et.
4. **Load unpacked** seç.
5. Birbaşa `manifest.json` olan design folder-ini seç.
6. Repository root və ya parent style folder-i seçmə.
7. Hədəf web saytını aç.
8. Popup varsa Chrome toolbar-dan extension ikonuna kliklə.

## 6. Dəyişikliyi test et

CSS və ya JavaScript dəyişdikdən sonra:

1. Faylı save et.
2. `chrome://extensions/` aç.
3. Extension üçün **Reload** bas.
4. Hədəf səhifəni refresh et.
5. Problem qalırsa `Ctrl+Shift+R` ilə hard refresh et.

## 7. Manifest xətası

Chrome **Manifest file is missing or unreadable** deyirsə, seçdiyin folder-i yoxla:

```text
gemini
└── glassmorphism
    └── gemini-glassmorphism
        ├── manifest.json   <-- bunu birbaşa saxlayan folder seçilməlidir
        ├── content.js
        ├── glass.css
        └── ...
```

`manifest.json` bir alt folder-dədirsə, parent folder-i seçmək düzgün deyil.

## 8. UI selector problemini araşdır

AI web tətbiqlərinin DOM-u tez-tez dəyişir. Problem yarananda bütün səhifəni universal CSS ilə dəyişmək düzgün yanaşma deyil.

F12 ilə:

1. konkret elementi inspect et;
2. semantic elementləri yoxla;
3. ARIA role-lara bax;
4. data attribute və testid-ləri yoxla;
5. stabil container tap;
6. yalnız həmin hissəyə dar selector əlavə et;
7. dark və light mode-u ayrıca yoxla.

Üstünlük sırası:

- semantic element;
- data attribute/testid;
- ARIA role;
- stabil container;
- class selector yalnız fallback kimi.

## 9. Dark/light test

Gemini həm light, həm dark theme dəstəkləyir. Hər ikisini ayrıca yoxla.

Yoxlanılmalı hissələr:

- əsas background;
- sidebar;
- chat history;
- user message;
- model response;
- composer;
- düymə və ikonlar;
- menu;
- dialog;
- code block;
- table;
- focus vəziyyəti.

Bir release-də işləyən class adının növbəti release-də qalacağını qəbul etmə.

## 10. Performance

WebGL və ya animated background varsa:

- effekt ON/OFF test et;
- Low/Medium/High quality yoxla;
- tab gizli və açıq vəziyyətdə yoxla;
- reduced-motion rejimini yoxla;
- lazım olduqda GPU istifadəsini yoxla.

WebGL və ya backdrop-filter işləmədikdə design fallback verməlidir.

## 11. Yeni design yarat

Mövcud design-in üzərinə yazma.

```cmd
mkdir gemini\glassmorphism\new-design
```

Chrome extension design üçün tipik struktur:

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

Sonra platform və style README-lərinə relative link əlavə et.

## 12. design.md-də nə olmalıdır

Hər design sənədi bunları izah etməlidir:

- design adı;
- platforma;
- visual style;
- texnologiyalar;
- məqsəd;
- arxitektura;
- UI hissələri;
- faylların vəzifəsi;
- quraşdırma;
- CMD setup;
- development workflow;
- troubleshooting;
- təhlükəsiz sərhədlər;
- compatibility/research qeydləri.

design.md faylları English-only saxlanılır.

## 13. Git workflow

Dəyişiklikləri yoxla:

```cmd
git status
git diff
```

Commit:

```cmd
git add .
git commit -m "Add Gemini glassmorphism design"
```

Push:

```cmd
git push origin main
```

## 14. Push-dan əvvəl yoxla

```cmd
git status
git diff --check
```

Bunları təsdiqlə:

- design folder-də öz `design.md` var;
- README linkləri relative-dir;
- köhnə design overwrite edilməyib;
- manifest-də göstərilən fayllar mövcuddur;
- lokal filesystem path-ləri təsadüfən koda düşməyib;
- lazımsız remote script yoxdur.

## 15. Hazırkı giriş nöqtələri

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

Gemini üçün əsas URL: `https://gemini.google.com/`.
