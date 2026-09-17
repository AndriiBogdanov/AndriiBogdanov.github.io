/**
 * Рендерит OG-картинку и apple-touch-icon тем же шрифтом, что и сайт.
 * Шрифт вшивается в HTML как data-URI, чтобы не зависеть от системных шрифтов.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
mkdirSync(pub, { recursive: true });

const font = readFileSync(new URL('fonts/archivo-subset.woff2', pub)).toString('base64');

const base = `
  @font-face {
    font-family: 'Archivo';
    src: url(data:font/woff2;base64,${font}) format('woff2-variations');
    font-weight: 400 700;
    font-stretch: 62% 125%;
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    background: #000;
    color: #ededee;
    font-family: 'Archivo', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;

const og = `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 1200px; height: 630px; padding: 76px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  h1 { font-size: 132px; font-weight: 700; font-stretch: 118%; line-height: 0.86; letter-spacing: -0.035em; text-transform: uppercase; }
  .meta { display: flex; justify-content: space-between; align-items: flex-end; font-size: 30px; }
  .meta span:last-child { color: #8b9097; }
  .dot { width: 22px; height: 22px; border-radius: 50%; background: #ff4a1c; margin-bottom: 40px; }
</style>
<div class="dot"></div>
<h1>Andrii<br>Bogdanov</h1>
<div class="meta"><span>Web Developer &amp; Designer</span><span>Berlin, Germany</span></div>`;

const icon = `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 180px; height: 180px; display: grid; place-items: center; }
  span { font-size: 86px; font-weight: 700; font-stretch: 118%; letter-spacing: -0.04em; color: #fff; }
</style><span>AB</span>`;

const browser = await chromium.launch();

const p1 = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p1.setContent(og, { waitUntil: 'load' });
await p1.evaluate(() => document.fonts.ready);
await p1.screenshot({ path: new URL('og.png', pub).pathname });

const p2 = await browser.newPage({ viewport: { width: 180, height: 180 } });
await p2.setContent(icon, { waitUntil: 'load' });
await p2.evaluate(() => document.fonts.ready);
await p2.screenshot({ path: new URL('apple-touch-icon.png', pub).pathname, omitBackground: false });

await browser.close();
console.log('public/og.png + public/apple-touch-icon.png');
