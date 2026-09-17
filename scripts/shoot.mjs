/**
 * Скриншоты сайтов-кейсов для карточек работ.
 * Жёсткий бюджет времени на сайт: зависший внешний сайт не должен вешать сборку ассетов.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || './assets-src';
const ONLY = process.argv[3];
mkdirSync(OUT, { recursive: true });

const SITES = [
  { id: 'danov', url: 'https://www.danovmusic.com/' },
  { id: 'crng', url: 'https://www.crngrecords.com/' },
  { id: 'klapp', url: 'https://klapp.ua/' },
  { id: 'hauptstaedterinnen', url: 'https://xn--die-hauptstdterinnen-lzb.de/' },
  { id: 'smartmaster', url: 'https://smart-master.es/' },
  { id: 'nadiia', url: 'https://nadiia-sheremetieva.com/' },
].filter((s) => !ONLY || s.id === ONLY);

const ACCEPT = /^(accept all|accept|alle akzeptieren|akzeptieren|zustimmen|aceptar todo|aceptar|прийняти|прийняти всі|погоджуюсь|принять|i agree|got it|ok)$/i;

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout: ${label}`)), ms)),
  ]);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'en-US',
});

for (const site of SITES) {
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const t0 = Date.now();
  let note = '';

  try {
    await withTimeout(
      (async () => {
        await page.goto(site.url, { waitUntil: 'load', timeout: 25000 }).catch(() => {});
        await page.waitForTimeout(2000);

        const btn = page.getByRole('button', { name: ACCEPT }).first();
        if ((await btn.count().catch(() => 0)) > 0) {
          await btn.click({ timeout: 3000 }).catch(() => {});
          note = 'cookie-closed';
          await page.waitForTimeout(700);
        }

        // подтолкнуть lazy-картинки и вернуться наверх
        await page
          .evaluate(async () => {
            for (let i = 1; i <= 3; i++) {
              window.scrollTo(0, window.innerHeight * i);
              await new Promise((r) => setTimeout(r, 200));
            }
            window.scrollTo(0, 0);
          })
          .catch(() => {});
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${OUT}/${site.id}.png`, timeout: 15000 });
      })(),
      55000,
      site.id,
    );
    console.log(`ok   ${site.id}  ${((Date.now() - t0) / 1000).toFixed(1)}s ${note}`);
  } catch (e) {
    console.log(`FAIL ${site.id}  ${String(e).split('\n')[0]}`);
  }
  await page.close().catch(() => {});
}

await browser.close();
