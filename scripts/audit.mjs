/**
 * Аудит собранного сайта: поднимает статику из dist/ внутри этого же процесса
 * (без внешнего dev-сервера), снимает скриншоты на телефоне и десктопе
 * и считает реальный вес первой загрузки.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const OUT = fileURLToPath(new URL('../audit/', import.meta.url));
const PORT = 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || '/').split('?')[0]);
    if (path.endsWith('/')) path += 'index.html';
    const file = join(DIST, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    const info = await stat(file).catch(() => null);
    const target = info?.isDirectory() ? join(file, 'index.html') : file;
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': MIME[extname(target)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(PORT, r));

const { mkdirSync } = await import('node:fs');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function measure(path, label, viewport, isMobile) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
    userAgent: isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await ctx.newPage();

  let bytes = 0;
  const seen = new Map();
  page.on('response', async (resp) => {
    try {
      const buf = await resp.body();
      bytes += buf.length;
      seen.set(resp.url().replace(`http://localhost:${PORT}`, ''), buf.length);
    } catch {
      /* redirects etc. */
    }
  });

  await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const initial = bytes;
  await page.screenshot({ path: join(OUT, `${label}-top.png`) });
  await page.screenshot({ path: join(OUT, `${label}-full.png`), fullPage: true });

  const layout = await page.evaluate(() => {
    const doc = document.documentElement;
    const limit = doc.clientWidth + 0.5;
    const guilty = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > limit)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className || '—'}`)
      .slice(0, 4);
    // ширина самого текста, а не блока: блок растянут на колонку
    const name = [...document.querySelectorAll('.hero__name span')].map((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      return `${s.textContent}=${Math.round(range.getBoundingClientRect().width)}px`;
    });
    return { overflow: doc.scrollWidth > doc.clientWidth, guilty, name };
  });

  console.log(
    `${label.padEnd(16)} first load ${(initial / 1024).toFixed(1)} kB` +
      `  ·  h-overflow: ${layout.overflow ? 'YES ⚠️' : 'no'}` +
      (layout.name.length ? `  ·  ${layout.name.join(' / ')}` : ''),
  );
  if (layout.guilty.length) console.log(`   overflowing: ${layout.guilty.join(', ')}`);
  const top = [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [url, size] of top) console.log(`   ${(size / 1024).toFixed(1).padStart(7)} kB  ${url}`);

  await ctx.close();
}

await measure('/', 'home-390', { width: 390, height: 844 }, true);
await measure('/', 'home-1280', { width: 1280, height: 900 }, false);
await measure('/qr/', 'qr-390', { width: 390, height: 844 }, true);

await browser.close();
server.close();
