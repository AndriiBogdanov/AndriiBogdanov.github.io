import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const MIME = { '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(DIST, normalize(p));
    const i = await stat(f).catch(() => null);
    const t = i?.isDirectory() ? join(f, 'index.html') : f;
    res.writeHead(200, { 'Content-Type': MIME[extname(t)] || 'application/octet-stream' }).end(await readFile(t));
  } catch { res.writeHead(404).end('nf'); }
});
await new Promise((r) => server.listen(4402, r));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:4402/', { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const read = () => page.locator('.to-top__ring').evaluate((el) => ({
  opacity: +getComputedStyle(el.parentElement).opacity.slice(0, 4),
  ring: getComputedStyle(el).getPropertyValue('--read').trim(),
}));

console.log('вверху  ', await read());
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(600);
console.log('середина', await read());
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(600);
console.log('низ     ', await read());
await page.screenshot({ path: 'audit/to-top.png' });

await page.locator('.to-top').click();
await page.waitForTimeout(1600);
console.log('после клика scrollY =', await page.evaluate(() => Math.round(window.scrollY)));

await browser.close();
server.close();
