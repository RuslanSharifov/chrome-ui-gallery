# 🤝 Chrome UI Gallery layihəsinə töhfə ver

[← Ana səhifə](./README.md) · [English / tam qaydalar](./CONTRIBUTING.md)

Hər kəs öz Chrome extension-unu, UI dizaynını, tərcüməsini və ya bug düzəlişini bu layihəyə əlavə edə bilər.

## Necə göndərim?

1. GitHub-da repository-ni **Fork** et.
2. Öz fork-unu kompüterinə **Clone** et.
3. Yeni branch yarat: **git switch -c add/my-tool**.
4. Yeni tool-u **Tools/my-tool/** folderinə əlavə et.
5. **manifest.json** və **README.md** daxil olmaqla bütün lazımi faylları əlavə et.
6. İstəsən **gallery.json** ilə tool-un müəllifini, rəngini və təsvirini əlavə et. **docs/app.js** və HTML siyahısını dəyişmək lazım deyil.
7. **node scripts/validate.mjs** ilə faylları yoxla və **chrome://extensions** vasitəsilə test et.
8. Dəyişikliklərini GitHub-a push et və **Pull Request** aç.

UI dizaynı əlavə edirsənsə, uyğun platforma və stil qovluğundan istifadə et; hər dizaynın ayrıca **design.md** faylı olmalıdır.

## Təhlükəsizlik

- Token, parol, cookie və ya şəxsi məlumatları push etmə.
- İstifadə olunan icazələrin səbəbini README-də yaz.
- Başqasının kodunu yalnız uyğun lisenziya/icazə ilə paylaş.
- Mənbə kodunda gizli izləmə və uzaqdan yüklənən icra olunan kod olmamalıdır.

**[Tool şablonunu aç](./templates/chrome-extension-tool/README.md)** · **[Pull Request siyahısı](./.github/PULL_REQUEST_TEMPLATE.md)** · **[Tam qaydalar](./CONTRIBUTING.md)**

## Sayta avtomatik əlavə olunma

Pull Request yoxlanılıb **main** branch-inə birləşdiriləndən sonra GitHub Actions extension-un manifest.json faylını tapır, kataloqu yeniləyir və saytda yeni kart yaradır. [Ətraflı avtomatlaşdırma təlimatı](./docs/README.md) · [gallery.json qaydaları](./docs/CATALOG.md).
