import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.argv[2] || 'https://andriibogdanov.github.io';
mkdirSync('audit', { recursive: true });
const b = await chromium.launch();
for (const [label, vp, path] of [
  ['live-390', { width: 390, height: 844 }, '/'],
  ['live-qr', { width: 390, height: 844 }, '/qr/'],
  ['live-1280', { width: 1280, height: 900 }, '/'],
]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: vp.width < 500, hasTouch: vp.width < 500 });
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `audit/${label}.png` });
  await ctx.close();
}
await b.close();
console.log('ok');
