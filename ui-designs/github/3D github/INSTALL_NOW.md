# 🚀 GitHub Glassmorphism v4.0 - Qurulum Talimatı

## ✅ ZIP Faylı Aldınız!

`github-glassmorphism-v4.0.zip` faylı **BAŞ BAŞA HƏR ŞEY İÇƏRİSİNDƏ**:
- ✅ Extension kodları (manifest, JS, CSS, HTML)
- ✅ İkonalar (16, 32, 48, 128px)
- ✅ **Bütün dokumentasiya**
- ✅ Dev Mode (lokal update)
- ✅ **HAZIR QURULMAĞA**

---

## 🎯 2 DƏQİQƏYƏ QURULUM

### Addım 1: ZIP-i Çıxarın

**Windows**:
1. `github-glassmorphism-v4.0.zip` sağ klikləyin
2. "Extract All..." seçin
3. İstədiyiniz yerdə çıxarın

**Mac**:
1. `github-glassmorphism-v4.0.zip` çift klikləyin
2. Otomatik çıxarılır

**Linux**:
```bash
unzip github-glassmorphism-v4.0.zip
```

### Addım 2: Chrome Açın

```
chrome://extensions/
```

(Adres sətrinə yapışdırın və Enter basın)

### Addım 3: Developer Mode

1. Sağ üstdə "Developer mode" toggle-ini **açın**
2. Yeril mavi rəngə çevriləcək

### Addım 4: "Load unpacked" 

1. Mavi "Load unpacked" düyməsinə klikləyin
2. Çıxardığınız **`github-glassmorphism-v4.0`** qovluğunu seçin
3. "Select Folder" klikləyin

### Addım 5: İcazə Verin

Chrome soruşacaq: "Bu uzantı səhifələrə daxil olmağa icazə vermə?"
- ✅ "Allow" klikləyin

### Addım 6: Test Edin

1. **github.com**-a gedin
2. **Extension ikonuna** klikləyin (toolbar-da)
3. Popup açılmalı
4. "Aurora" düyməsinə klikləyin
5. GitHub-da **mavi-bənövşə effektlər** görüləcək

✨ **İşiniz bitdi!**

---

## 🎮 DEV MODE - Lokal Update

Popup-ın altında **🔄 Dev Reload** düyməsi var:

```
1. Parametrləri dəyiş (slider, toggle)
2. "Save" klikləyin
3. "🔄 Dev Reload" klikləyin
4. GitHub səhifəsi yenilənər
5. Yeni parametrlər göriləcəkdir
```

### Console Commands (F12)

GitHub səhifəsində F12 → Console:

```javascript
// Temani dəyiş
__GUG_DEV__.theme("neon")

// Blur dəyiş
__GUG_DEV__.blur(20)

// Proximity dəyiş
__GUG_DEV__.proximity(300, 150)

// Səhifəni yenilə
__GUG_DEV__.reload()

// Parametrləri göstər
__GUG_DEV__.settings()
```

**Daha ətraflı**: `DEV_MODE.md` faylını oxuyun

---

## 📁 ZIP İçərisində Nə Var?

```
github-glassmorphism-v4.0/
├── 🔴 EXTENSION FAYLARI (LAZIM)
│   ├─ manifest.json .............. Konfigurasyon
│   ├─ index.html ................. Popup arayüzü
│   ├─ script.js .................. Kontroller
│   ├─ content.js ................. GitHub injector + DEV MODE
│   ├─ glass.css .................. Effektlər
│   ├─ style.css .................. Popup üslubu
│   └─ icons/ ..................... HAZIR ikonalar
│
├── 🔵 DOKUMENTASIYA (OXUMAQ ÜÇÜn)
│   ├─ START_HERE.md .............. Başlayın buradan!
│   ├─ README.md .................. Xüsusiyyətlər
│   ├─ SETUP.md ................... Qurulum
│   ├─ QUICK_REFERENCE.md ......... Sürətli arayış
│   ├─ DEV_MODE.md ................ Dev Mode talimatı
│   ├─ DESIGN.md .................. Texniki
│   ├─ FEATURES.md ................ Xüsusiyyətlər
│   ├─ IMPROVEMENTS.md ............ Nə dəyişdi
│   └─ CHANGELOG.md ............... Versiya tarixi
```

---

## ⚠️ Bir Şey Xərab Oldu?

### Error: "Could not load icon"
- ✅ **ÇÖZÜLDÜ!** ZIP-də ikonlar var
- Qovluğu tam çıxardığınızdan əmin olun

### Error: "Failed to load extension"
- ✅ Qovluğun bütün faylları var
- ✅ `manifest.json` olduğundan əmin olun
- ✅ qovluğun `icons/` alt-qovluğu var

### Effects Görünmür
1. GitHub səhifəsini refresh edin (F5)
2. Extension popup-ını açıb "Aurora" klikləyin
3. Ən azı 2-3 saniyə gözləyin

### Icons Qara/Qrili
- Normal! Placeholder ikonlar
- Tema dəyişdikdə görüləcəkdir

---

## ✅ Qurulum Checklist

- [ ] ZIP faylını çıxardınız
- [ ] `chrome://extensions/` açdınız
- [ ] "Developer mode" açdınız
- [ ] "Load unpacked" kliklədiniz
- [ ] `github-glassmorphism-v4.0` qovluğunu seçdiniz
- [ ] Uzantı siyahıda görünür
- [ ] github.com-a gədiniz
- [ ] Extension ikonunu kliklədiniz
- [ ] Popup açıldı
- [ ] "Aurora" kliklədiniz
- [ ] Mavi-bənövşə effektlər görünür ✨

---

## 🎓 İlk Addımlar

### 1. Qurum Bitdikdən Sonra

```
1. Bütün 6 temani sınayın
2. Aurora → Matrix → Ice → Neon → Midnight → Minimal
3. Hər birində 1-2 saniyə gözləyin
```

### 2. Popup-da Oynayın

```
1. "Glass" tabına gedin
2. Blur sürüşdürücüsünü tərpətdən sağa çəkin
3. "Save" klikləyin
4. "Dev Reload" klikləyin
5. Bulanıqlıq dəyişəcək
```

### 3. Proximity Sınaması

```
1. "3D/Proximity" tabına gedin
2. "Proximity Distance" 400-ə qoyun
3. "Save" + "Dev Reload"
4. Siçanınızı kartın yanına getdirin
5. 200px uzaqdan reaksiya göstərəcək!
```

### 4. Console Oynama

```
1. github.com-da F12 açın
2. Console sekmə
3. Yapışdırın:
   __GUG_DEV__.theme("neon")
4. Enter basın - tema dəyişəcək!
```

---

## 🚀 Optimal Setup

### Ekranı Ayarlayın

```
┌─────────────────────────────────────┐
│  Chrome DevTools (F12)              │
│  - Console tab açıq                 │
│  - __GUG_DEV__ commands burada      │
├──────────────┬──────────────────────┤
│ Extension    │  GitHub.com Tab      │
│ Popup        │                      │
│ (pin-ə al)   │  - Effektlər burada  │
└──────────────┴──────────────────────┘
```

Beləliklə hər şeyi yan-yana görürsünüz.

---

## 📋 İlk Günün Roadmap

### 0-5 dəq
✅ Qurulum və test

### 5-10 dəq
✅ Bütün temalar sınaması

### 10-20 dəq
✅ Blur, Opacity, Radius dəyişən

### 20-30 dəq
✅ Proximity Distance/Sensitivity tuning

### 30-40 dəq
✅ Glow Intensity, 3D Depth ayarlama

### 40+ dəq
✅ Console commandları deneme

---

## 💡 En Çok Sorulan

**S: Qovu yenidən load etməsi lazımdırmı?**
Cevap: Xəyir! Bütün faylları bir dəfə "Load unpacked" et, hər zaman işləyər.

**S: Dev Reload çox sürətli?**
Cevap: Evet! 0.5-1 saniyə işləyər. F5-dən daha yaxşı.

**S: Parametrləri unuttum?**
Cevap: "Reset" düyməsinə klikləyin, hamısı başlanğıca qayıtacaq.

**S: Console Commandları Forget ettim?**
Cevap: Console-da __GUG_DEV__. yazıb Tab basın - autocomplete gələcək.

**S: Uzantı Pin-ə Almaq Lazımmı?**
Cevap: Vacib deyil ama yaxşıdır. Toolbar-da ikonun sağında piqtur düyməsi.

---

## 🔐 Güvənlik

✅ **Bütün lokal** - heç bir cloud sync
✅ **Məlumat yoxdur** - heç nə saxlanılmır
✅ **Açıq kod** - bütün scriptləri oxuyunuz

---

## 📞 Hil Lazım Olsa

1. **Başlanğıc**: `START_HERE.md` oxuyun
2. **Qurulum**: Bu faylı oxuyunuz
3. **Xüsusiyyətlər**: `README.md` oxuyun
4. **Dev Mode**: `DEV_MODE.md` oxuyun
5. **Sürətli Arayış**: `QUICK_REFERENCE.md` oxuyun

---

## 🎉 Başa Çatdı!

```
ZIP Faylı → Çıxarın → Load unpacked → Test → Oynayın!
```

**Xoş istifadələr!** 🎨✨

---

**Version**: 4.0.0
**Tarix**: October 2026
**Status**: Production Ready ✅
