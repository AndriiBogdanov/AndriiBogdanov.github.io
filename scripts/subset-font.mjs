/**
 * Урезает переменный Archivo до символов, которые реально встречаются на карточке.
 * Оси wght и wdth сохраняются — без них поедут и заголовки, и текст.
 * Источник: public/fonts/archivo-latin.woff2 (latin-подмножество Google Fonts).
 */
import subsetFont from 'subset-font';
import { readFile, writeFile } from 'node:fs/promises';

const SRC = new URL('../assets-src/fonts/archivo-latin.woff2', import.meta.url);
const OUT = new URL('../public/fonts/archivo-subset.woff2', import.meta.url);

const chars = new Set([
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'0123456789',
  ...' .,:;!?&@#%()[]{}/\\|-_+=*"\'`^~<>$',
  ...'äöüÄÖÜßéèêáíóúñçåøæ', // немецкие, испанские и скандинавские имена клиентов
  ...'·•©®°—–…‘’“”→↗←↓↑',
]);

const source = await readFile(SRC);
const subset = await subsetFont(source, [...chars].join(''), {
  targetFormat: 'woff2',
  variationAxes: { wght: { min: 400, max: 700 }, wdth: { min: 100, max: 125 } },
});

await writeFile(OUT, subset);
console.log(
  `archivo-subset.woff2  ${(subset.length / 1024).toFixed(1)} kB` +
    `  (было ${(source.length / 1024).toFixed(1)} kB)`,
);
