# 🔧 Dev Mode - Lokal Update Bələdçi

## ⚡ Dev Reload Düyməsi

Extension popup-ında **🔄 Dev Reload** düyməsi vardır. Bu düymə:

1. Cari parametrləri saxlayır
2. GitHub səhifəsini yenidən yükləyir
3. Yeni parametrləri tətbiq edir
4. Dəyişiklikləri canlı göstərir

### Necə İstifadə Etmək

```
1. Extension popup-ını açın
2. Parametrləri tənzimlə (blur, opacity, proximity, vb.)
3. "Save" düyməsinə klikləyin (mühüm!)
4. "🔄 Dev Reload" düyməsinə klikləyin
5. GitHub səhifəsi yenidən yüklənəcək
6. Yeni effektlər görüləcəkdir
```

---

## 💻 Console Dev Commands

Dev Mode aktiv olduqda, GitHub səhifəsində F12 açıb Console-a gedin.

Buradan istifadə edə biləcəyiniz əmrlər:

### Səhifəni Yenidən Yükləyin
```javascript
__GUG_DEV__.reload()
```
Parametrləri saxlamaqla səhifəni refresh edir.

### Cari Parametrləri Göstərin
```javascript
__GUG_DEV__.settings()
```
Cərgəli cədvəl şəklində bütün parametrləri göstərir.

### Temani Dəyişin
```javascript
__GUG_DEV__.theme("neon")
// Mövcud temalar: aurora, matrix, ice, neon, midnight, minimal
```

### Blur Dəyərini Dəyişin
```javascript
__GUG_DEV__.blur(20)
// Aralıq: 6-46 px
```

### Opacity Dəyərini Dəyişin
```javascript
__GUG_DEV__.opacity(60)
// Aralıq: 25-82 %
```

### Proximity Dəyərlərini Dəyişin
```javascript
__GUG_DEV__.proximity(300, 150)
// proximity(distance, sensitivity)
// Distance: 80-400 px
// Sensitivity: 50-300 %
```

---

## 🎯 Dev Workflow

### Sürətli Test Döngüsü

```
1. Popup açın
   ↓
2. Slider tənzim edin (məsələn Blur: 20)
   ↓
3. "Save" klikləyin
   ↓
4. "Dev Reload" klikləyin
   ↓
5. GitHub yenilənir - yeni effekti gör
   ↓
6. Beğənsən, tamam. Bəyənmədisən, dəyiş
   ↓
7. Repeat 2-5
```

### Console ilə Sürətli Dəyişikliklər

Popup-ı açmadan console-dan dəyişiklik et:

```javascript
// Neon temaya dəyiş
__GUG_DEV__.theme("neon")

// Blur azalt
__GUG_DEV__.blur(15)

// Proximity böyüt
__GUG_DEV__.proximity(350, 180)

// Səhifəni yenilə
__GUG_DEV__.reload()

// Cari ayarları çap et
__GUG_DEV__.settings()
```

---

## 🐛 Debugging İpuçları

### Effektlər Görünmüyor?
```javascript
// Parametrləri yoxlayın
__GUG_DEV__.settings()

// Proximity distance artırın
__GUG_DEV__.proximity(400, 150)

// Səhifəni yenilə
__GUG_DEV__.reload()
```

### Bir Şey Xərab Oldu?
```javascript
// Popup-ı açın
// "Reset" düyməsinə klikləyin
// "Save" klikləyin
// "Dev Reload" klikləyin
// Həmmə başlanğıc parametrlərinə qayıtacaq
```

### Performans Testi
```javascript
// Çəkili ayarlar
__GUG_DEV__.theme("neon")
__GUG_DEV__.blur(40)
__GUG_DEV__.proximity(400, 250)
__GUG_DEV__.reload()

// Chrome DevTools → Performance tab
// Record 3-5 saniyə
// Baxın FPS qrafiki
```

---

## 📝 Konsol Mesajları

GitHub-da console açdığınızda görəcəksiniz:

```
🎨 GitHub Glassmorphism PRO v4.0 Dev Mode Aktiv
Dostuplu əmrlər:
  __GUG_DEV__.reload() - Səhifəni yenidən yükləyin
  __GUG_DEV__.settings() - Cari parametrləri göstərin
  __GUG_DEV__.theme("neon") - Temani dəyişin
  __GUG_DEV__.blur(20) - Blur dəyərini dəyişin
  __GUG_DEV__.opacity(60) - Opacity dəyərini dəyişin
  __GUG_DEV__.proximity(300, 150) - Proximity dəyərlərini dəyişin
```

---

## ⚙️ Teknik Məlumatlar

### Yenidən Yüklənmə Prosesi

1. Popup-da düğmə klikləndikdə
2. `broadcast()` cari parametrləri saxlayır
3. `chrome.tabs.sendMessage()` GitHub səhifəsinə mesaj göndərir
4. Content script `location.reload()` əmrini alır
5. Səhifə yenilənir, parametrlər yenidən tətbiq olunur

### Dev Mode Aktivasiyası

Dev Mode otomatik aktivləşir əgər:
- Hostname `github.com`-dursa
- `__GUG_DEV__` global objeksi yaradılır
- Console mesajı göstərilir

### Console Əmrləri

Hər əmr əslində:
```javascript
apply({setting: value})
```
çağırışıdır, sonra `reload()` isə:
```javascript
chrome.runtime.sendMessage({type:'DEV_RELOAD'})
```
göndərir.

---

## 🎓 Praktik Nümunələr

### Nümunə 1: Tema Testi

```javascript
// Bütün temalarını sınaş
for(let theme of ['aurora','matrix','ice','neon','midnight','minimal']){
  __GUG_DEV__.theme(theme)
  __GUG_DEV__.reload()
  // 3-5 saniyə baxıb, sonra dəyiş
}
```

### Nümunə 2: Proximity Tuning

```javascript
// Distance test
__GUG_DEV__.proximity(80, 100)
__GUG_DEV__.reload()
// Siçanınızı elementə döndərüb sınaş

// Daha uzaqdan aktivləşdirmə
__GUG_DEV__.proximity(400, 100)
__GUG_DEV__.reload()
```

### Nümunə 3: Blur Uyğunlaşdırması

```javascript
// Sürətli test
for(let blur of [6, 12, 18, 24, 30, 40, 46]){
  __GUG_DEV__.blur(blur)
  console.log('Testing blur: ' + blur + 'px')
  __GUG_DEV__.reload()
  // Hər birinə 2-3 saniyə baxın
}
```

---

## 🚀 Optimal Dev Setup

### Browser Tənzimləmələri
1. Chrome açın
2. `chrome://extensions/` → Developer mode ON
3. Uzantını "Load unpacked" ilə yükləyin
4. GitHub tab-ı açın
5. F12 → Console açın
6. Extension popup-ını pin-ə alın (yan-yana görünür)

### Window Arangemanı
- Sol: Chrome DevTools (Console)
- Sağ üst: Extension Popup
- Sağ aşağı: GitHub tab-ı

Beləliklə, hər şeyi görüp tənzimlə bilərsiniz.

---

## 📊 Parametr Aralıqları Cheat Sheet

```javascript
// Blur
__GUG_DEV__.blur(6)    // Crisp minimum
__GUG_DEV__.blur(24)   // Medium default
__GUG_DEV__.blur(46)   // Very blurred maximum

// Opacity
__GUG_DEV__.opacity(25)  // Transparent
__GUG_DEV__.opacity(58)  // Default
__GUG_DEV__.opacity(82)  // Opaque

// Proximity Distance
__GUG_DEV__.proximity(80, 100)    // Close detection
__GUG_DEV__.proximity(200, 150)   // Medium default
__GUG_DEV__.proximity(400, 200)   // Far detection

// Sensitivity
__GUG_DEV__.proximity(200, 50)    // Subtle
__GUG_DEV__.proximity(200, 150)   // Normal
__GUG_DEV__.proximity(200, 300)   // Dramatic
```

---

## ✅ Faydalı Təlimatlar

### "Save" düyməsini HƏR ZAMAN klikləyin
Parametrləri dəyişdirdiyiniz zaman, "Save" klikləməsəniz saxlanılmaz.

### "Dev Reload" klikləməsə, səhifə yenilənmir
Əl ilə F5 basaraq yeniləyə bilərsiniz, amma "Dev Reload" daha yaxşıdır.

### Console-da Error Gördünüz?
- Extension yenidən yükləyin
- GitHub səhifəsini refresh edin
- Console yenidən açın

### Ayarlar Reset Oldu?
- `__GUG_DEV__.settings()` çap edin
- Əgər default-sa, popup-ı açıb "Reset" klikləyin

---

## 🎯 Ən Sürətli Workflow

```
Popup açın (yan-yana)
    ↓
Slider tənzim edin
    ↓
Save klikləyin
    ↓
Dev Reload klikləyin (0.5 saniyə)
    ↓
Nəticəni gör (1 saniyə)
    ↓
Sınava 2 saniyə
    ↓
Beğən? Tamam. Yox? Dəyiş, repeat.
    ↓
5-10 dəqiqə tənzimləmədən sonra mükəmməl!
```

---

## 🔒 Güvenlik Notları

- Dev Mode **sadəcə github.com-da** işləyir
- Digər saytlarda `__GUG_DEV__` mevcut deyil
- Content Security Policy hər şeyi qorudu
- Hər şey lokal - heç bir data xarici-yə gönmərilmir

---

## 📞 Hil Lazım Olsa

- **Popup Refresh Problemi**: F12 açıb refresh edin
- **Əmrlər İşləmir**: GitHub-da olduğunuza əmin olun
- **Console Mesajı Yoxdur**: Uzantını yenidən yükləyin

---

**v4.0 Dev Mode** | **Tam Lokal** | **Sürətli Test**

Happy Debugging! 🎨✨
