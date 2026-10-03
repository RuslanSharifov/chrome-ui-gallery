# Chrome UI Gallery — Tam Kurulum Rehberi

Bu rehber repository'yi klonlamayı, yapıyı anlamayı, Manifest V3 Chrome uzantısını yerel olarak yüklemeyi, değişiklikleri test etmeyi, selector sorunlarını çözmeyi ve yeni tasarım eklemeyi açıklar.

## 1. Gereksinimler

- Windows CMD veya başka bir terminal.
- Git.
- Google Chrome.
- Kod editörü.
- Hedef servis gerektiriyorsa Google hesabı.

Mevcut Vanilla HTML/CSS/JavaScript tasarımları Node.js veya build adımı gerektirmez.

## 2. Repository'yi klonla

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 3. Navigation yapısı

```text
README.md
  -> platform/README.md
    -> style/
      -> design-folder/
        -> design.md
        -> kod dosyaları
```

Mevcut örnekler:

- `chatgpt/glassmorphism/ai-prompt-tool/`
- `gemini/glassmorphism/gemini-glassmorphism/`

## 4. Design klasörünü aç

Gemini:

```cmd
cd gemini\glassmorphism\gemini-glassmorphism
dir
```

Chrome extension için `manifest.json` doğrudan bu klasörde bulunmalıdır.

## 5. Chrome extension yükle

1. Chrome'u aç.
2. `chrome://extensions/` adresine git.
3. **Developer mode** aç.
4. **Load unpacked** seç.
5. Doğrudan `manifest.json` içeren design klasörünü seç.
6. Repository root veya üst style klasörünü seçme.
7. Hedef web sitesini aç.
8. Popup varsa toolbar'dan extension ikonunu aç.

## 6. Değişiklikleri test et

CSS veya JavaScript değiştirdikten sonra:

1. Dosyayı kaydet.
2. `chrome://extensions/` aç.
3. Extension için **Reload** tıkla.
4. Hedef sayfayı yenile.
5. Gerekirse `Ctrl+Shift+R` ile hard refresh yap.

## 7. Manifest hatası

Chrome **Manifest file is missing or unreadable** diyorsa seçtiğin klasörde doğrudan `manifest.json` olmalıdır.

Gemini yolu:

```text
gemini\glassmorphism\gemini-glassmorphism\manifest.json
```

## 8. Selector sorunlarını araştır

AI web uygulamaları DOM yapısını değiştirebilir. Tek bir problemi çözmek için `body *` gibi universal selector kullanma.

F12 ile:

- doğru elementi inspect et;
- semantic elementleri kontrol et;
- ARIA ve data attribute'lara bak;
- stabil container bul;
- dar selector ekle;
- light ve dark modları test et.

Öncelik: semantic element → data attribute/testid → ARIA → stabil container → class fallback.

## 9. Theme testi

Gemini light ve dark theme destekler. Background, sidebar, chat history, kullanıcı mesajı, model cevabı, composer, butonlar, ikonlar, menüler, dialoglar, code block, tablolar ve focus durumlarını iki temada da kontrol et.

## 10. Performans

WebGL varsa ON/OFF, Low/Medium/High, görünür/gizli tab ve Reduced Motion test et. WebGL veya backdrop-filter yoksa fallback bulunmalıdır.

## 11. Yeni design oluştur

Mevcut design'i ezme.

```cmd
mkdir gemini\glassmorphism\new-design
```

Önerilen yapı:

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

Sonra platform ve style README dosyalarına relative link ekle.

## 12. Documentation

Her `design.md` design adını, platformu, stili, teknolojileri, amacı, mimariyi, dosyaları, kurulumu, CMD workflow'u, troubleshooting'i, sınırları ve compatibility notlarını açıklamalıdır.

`design.md` dosyaları yalnızca İngilizce tutulur.

## 13. Git

```cmd
git status
git diff
git add .
git commit -m "Add Gemini glassmorphism design"
git push origin main
```

Push öncesi:

```cmd
git diff --check
```

## 14. Güncel giriş noktaları

- ChatGPT: `chatgpt/glassmorphism/ai-prompt-tool/`
- Gemini: `gemini/glassmorphism/gemini-glassmorphism/`

Gemini URL: `https://gemini.google.com/`.
