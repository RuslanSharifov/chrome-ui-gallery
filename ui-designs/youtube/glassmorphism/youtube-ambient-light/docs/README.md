# YouTube Ambient Light

YouTube videosunun ətrafında ambient işıq, həmçinin səs və altyazı üçün əlavə idarəetmə.

## Funksiyalar
- **Ambient işıq:** videonun kadrından rəng götürüb səhifənin arxasına bulanıq işıq verir. Bulanıqlıq, yayılma və intensivlik ayarlana bilir.
- **Player düyməsi:** video idarə panelində dişli (ayarlar) və teatr düymələri arasında yerləşir. Basanda ayarlar pəncərəsi açılır. Bütün ayarlar bu düymə ilə idarə olunur.
- **Toolbar ikonu:** yalnız aktiv/deaktiv edir (ON/OFF işarəsi ilə). Ayarlar menyusu yoxdur.
- **Ayarlar pəncərəsi:** üç tab: İşıq, Səs (ekvalayzer), Rejim (video, altyazı, fokus).
- **Sağ panel:** yorumlar yuxarıda, video tövsiyələri aşağıda; hər biri ayrıca scroll olunur, əsas video yerində qalır.
- **Video yüklənməsi:** videonu göstərməyi söndürmək olar, səs davam edir.
- **Ekvalayzer:** 5 zolaq (60 Hz – 12 kHz), Flat / Bass / Vokal / Kino preset-ləri.

## Quraşdırma
1. `chrome://extensions` səhifəsini açın.
2. Sağ yuxarıda **Developer mode** aktiv edin.
3. **Load unpacked** ilə bu qovluğu seçin.

## Qeydlər
- Ekvalayzer üçün brauzer bəzən ilk klikdən sonra audio kontekstini işə salmağı tələb edə bilər.
- YouTube interfeysi tez-tez dəyişir. Düymə işləməsə, `content/content.js` içində `.ytp-right-controls` və `#movie_player` selectorlarını yoxlayın.
- Videonun kənardan məsafəsi ayarı ambient işığın göründüyü boşluğu tənzimləyir.
- Tam ekranda ambient işıq görünmür (YouTube yalnız pleyeri göstərir); ayarlar pəncərəsi isə tam ekranda da açılır.
- Heç bir xarici server sorğusu göndərilmir; ayarlar `chrome.storage.sync` ilə saxlanılır.

## Versiya 1.2 əlavələri
- **Glass dizayn:** ayarlar pəncərəsi, sağ panel və video çərçivəsi şüşəvari görünüşdədir.
- **Sağ panel:** yorumlar və tövsiyələr ayrı-ayrı tab-larda; aralarında keçid düyməsi var, hər biri scroll olunur.
- **Fokus rejimi:** player bar-da ikinci düymə ilə açılır/bağlanır. Aktiv olanda ekranda yalnız mərkəzdə video qalır, neon effekti işləyir.
- **Sözlər:** alt yazı aktivdirsə, sol tərəfdə kiçik neon qutuda cari cümlə, sağda isə sözlər axır. Cari söz böyük və parlaq, keçilmiş sətirlər solğun, gələcək sözlər normal tonda görünür.
- Sözlərin vaxtlanması YouTube alt yazı DOM-undan təxmini hesablanır, söz-söz dəqiq vaxt yoxdur.

## Versiya 1.3
- Fokus rejimində video ekranın tam mərkəzində, ekran ölçüsündən asılı olaraq sabit ölçüdə görünür. Ambient məsafə (margin) videonun ətrafındakı boşluğu təyin edir.
- Sözlər (Apple Music üslubunda, slime animasiya ilə) sol tərəfdə axır.

## Versiya 1.4
- **Fabrika ayarları:** ayarlar pəncərəsinin başlığında və ekranın sol aşağısında həmişə görünən ↺ düyməsi bütün ayarları sıfırlayıb səhifəni yeniləyir.
- **LED parıltı:** videonun kənar işığı ayarlardan (Ambient işıq bölməsi) söndürülüb yandırıla bilir.
- **Fokus rejimi:** iki seçim var. "Yalnız video" videonu ortada saxlayır. "Fokusda sözlər" videonu solda kiçik hissədə, sözləri sağda Apple Music üslubunda yuxarı axan şəkildə göstərir (alt yazı avtomatik açılır).
- **Təhlükəsizlik:** pleyer ölçüsü etibarsız olarsa və ya ekran dəyişəndə fokus rejimi yenidən tətbiq olunur, problem davam edərsə avtomatik söndürülür.

## Navigation

[← Ambient Light](../README.md) · [Design notes](../design.md) · [YouTube](../../../README.md)

## Versiya 1.5 (1.2.0 manifest)
- **Yeni ayarlar pəncərəsi:** neumorphism üslubu, sadə tünd tonlar, neon yoxdur. Başlıqdakı ☀/☾ düyməsi ilə tünd və işıqlı rejim arasında keçid; seçim yadda qalır.
- **Daha sadə ayarlar:** beş açılan bölmə əvəzinə üç tab (İşıq · Səs · Rejim). Fabrika ayarları altda "Sıfırla" kimi, təsadüfi basılmasın deyə iki addımlıdır. Həmişə görünən ↺ düyməsi yalnız fokus rejimində göstərilir.
- **Video kənarında parıltı** artıq standart olaraq söndürülüdür və tək yumşaq rəngdədir.
- **Sürət:** ambient yalnız video oynayanda, tab görünəndə və tam ekranda olmayanda çəkilir; üç ayrı taymer bir animasiya dövrəsinə birləşdi; DOM müşahidəçisi throttle olunub və öz elementlərimizə reaksiya vermir; sürüşdürmə zamanı yalnız lazımi hissə yenilənir.
- **Düzəlişlər:** canlı söz rejimindəki `splitWords` xətası; sliderlərin `chrome.storage.sync` yazı limitini aşması (indi 400 ms-lik batch yazı); slider hərəkətinin əllə açılmış altyazını söndürməsi; ekvalayzer yadda qalıbsa səhifə açılanda səsin kəsilməsi (indi ilk toxunuşdan sonra qoşulur); yeni player strukturunda düymənin əlavə olunmaması riski; YouTube işıqlı temasında oxunmayan mətn.
