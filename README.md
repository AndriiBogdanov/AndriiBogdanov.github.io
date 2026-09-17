# andrii-card

QR-визитка: одна страница с контактами и работами + страница `/qr` с кодом для сканирования.
Astro, статическая сборка, деплой на GitHub Pages.

## Команды

| Команда | Что делает |
|---|---|
| `npm run build` | собирает сайт в `dist/` |
| `npm run audit` | поднимает `dist/`, снимает скриншоты 390/1280 в `audit/` и печатает вес первой загрузки |
| `npm run shots` | пересниимает скриншоты сайтов-кейсов в `assets-src/` (Playwright) |
| `npm run qr` | генерирует `print/qr.svg` и `print/qr-2000.png` для печати |
| `node scripts/subset-font.mjs` | пересобирает урезанный шрифт из `assets-src/fonts/archivo-latin.woff2` |
| `node scripts/make-images.mjs` | пересобирает `public/og.png` и `public/apple-touch-icon.png` |

Деплой — GitHub Actions при пуше в `main` (`.github/workflows/deploy.yml`).

## Где что лежит

- `src/data/profile.ts` — тексты, список работ, контакты (base64)
- `src/pages/index.astro` — карточка, `src/pages/qr.astro` — страница с QR
- `src/styles/global.css` — токены и вся вёрстка
- `src/assets/work/` — скриншоты кейсов (Astro сам делает webp и `srcset`)
- `assets-src/` — исходники: полные скриншоты и полный шрифт, в деплой не идут

## Смена адреса

Адрес зашит в двух местах — `src/data/profile.ts` (`siteUrl`) и `scripts/profile-url.mjs`.
После смены домена поменять оба, пересобрать сайт и **перевыпустить QR** (`npm run qr`):
старый напечатанный код будет вести на старый адрес.

## Контакты на странице

Телефон и email не лежат в HTML открытым текстом — ссылки и файл `.vcf` собираются
в браузере из base64. Это мешает автоматическим скраперам, но не прячет контакт
от человека, который откроет исходник. Без JavaScript кнопки контактов не работают.
