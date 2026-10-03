# Chrome UI Gallery — Hızlı Kurulum

Bu rehber, repository'yi CMD üzerinden klonlamayı, tasarımı yerel olarak açmayı, dosyaları düzenlemeyi ve değişiklikleri GitHub'a göndermeyi açıklar.

## 1. Repository'yi klonla
```cmd
git clone https://github.com/RuslanSharifov/chrome-ui-gallery.git
cd chrome-ui-gallery
```

## 2. Tasarım klasörüne geç
```cmd
cd chatgpt\\glassmorphism\\ai-prompt-tool
```

## 3. Dosyaları düzenle
`index.html`, `style.css`, `script.js` ve `design.md` dosyalarını tercih ettiğiniz editörle düzenleyin.

## 4. Yerel olarak test et
`index.html` dosyasını tarayıcıda açın.

## 5. Değişiklikleri GitHub'a gönder
```cmd
cd ..\\..\\..
git status
git add .
git commit -m "Update ChatGPT glassmorphism tool"
git push origin main
```

## 6. Yeni tasarım ekle
Ayrı bir klasör oluşturun ve Code ile Documentation bağlantılarını `chatgpt/README.md` dosyasına ekleyin.