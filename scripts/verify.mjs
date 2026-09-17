/**
 * Проверка живого сайта: кнопки контактов реально работают, vCard скачивается
 * и содержит то, что нужно, а QR со страницы /qr действительно ведёт на карточку.
 */
import { chromium } from 'playwright';
import jsQR from 'jsqr';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'https://andriibogdanov.github.io';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  acceptDownloads: true,
});
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: 'load' });

const links = await page.evaluate(() => ({
  whatsapp: document.querySelector('[data-link="whatsapp"]')?.getAttribute('href'),
  email: document.querySelector('[data-link="email"]')?.getAttribute('href'),
}));
console.log(`WhatsApp href : ${links.whatsapp}`);
console.log(`Email href    : ${links.email}`);

const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 15000 }),
  page.locator('[data-vcard]').first().click(),
]);
const vcfPath = join(tmpdir(), `verify-${Date.now()}.vcf`);
await download.saveAs(vcfPath);
const vcf = await readFile(vcfPath, 'utf8');
console.log(`\nvCard "${download.suggestedFilename()}" (${vcf.length} bytes):`);
console.log(
  vcf
    .split('\r\n')
    .map((l) => `   ${l}`)
    .join('\n'),
);

// /qr → декодируем код прямо с отрендеренной страницы
await page.goto(`${BASE}/qr/`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const shot = await page.locator('.qr-card').screenshot();
const { data, info } = await sharp(shot)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
console.log(`\nQR on /qr decodes to: ${decoded ? decoded.data : 'FAILED TO DECODE ⚠️'}`);

await browser.close();
