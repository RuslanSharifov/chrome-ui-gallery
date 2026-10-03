# Chrome UI Gallery — Hızlı Kurulum

Bu rehber, repository'yi CMD üzerinden klonlamayı, bir tasarımı yerel olarak açmayı, dosyaları düzenlemeyi ve değişiklikleri GitHub'a göndermeyi açıklar.

## 1. Repository'yi klonla

CMD'yi açın:

```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Tasarım klasörüne geç

```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Dosyaları düzenle

Klasörde şunlar bulunur:

```text
index.html
style.css
script.js
design.md
```

Bu dosyaları istediğiniz kod editörüyle düzenleyebilirsiniz.

## 4. Yerel olarak test et

`index.html` dosyasını tarayıcıda açın.

## 5. Değişiklikleri GitHub'a gönder

Repository kök dizinine dönün:

```cmd
cd ..\\..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Yeni tasarım ekle

Mevcut bir tasarımın üzerine yazmayın. Ayrı bir klasör oluşturun:

```text
chatgpt/
└── glassmorphism/
    └── my-new-tool/
        ├── index.html
        ├── style.css
        ├── script.js
        └── design.md
```

Ardından yeni tasarım için Code ve Documentation bağlantılarını `chatgpt/README.md` dosyasına ekleyin.

## Repository yapısı

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
