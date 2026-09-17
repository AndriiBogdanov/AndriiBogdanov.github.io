/**
 * Печатные файлы QR: вектор (SVG) для типографии и PNG 2000px для быстрой печати.
 * Коррекция ошибок H — код читается даже если угол потёрся или его частично закрыли.
 */
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';
import { profile } from './profile-url.mjs';

const OUT = new URL('../print/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const target = process.argv[2] || profile.siteUrl;
const opts = {
  errorCorrectionLevel: 'H',
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' },
};

const svg = await QRCode.toString(target, { ...opts, type: 'svg' });
writeFileSync(new URL('qr.svg', OUT), svg);

await QRCode.toFile(new URL('qr-2000.png', OUT).pathname, target, {
  ...opts,
  type: 'png',
  width: 2000,
});

console.log(`QR → print/qr.svg and print/qr-2000.png  (target: ${target})`);
