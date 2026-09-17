/**
 * Готовит скриншоты кейсов к репозиторию: 2880px PNG (по 2-5 МБ) → 1600px WebP.
 * Дальше Astro сам делает из них 480/720/1080. Исходники остаются в assets-src/,
 * в git они не идут.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, parse } from 'node:path';

const SRC = fileURLToPath(new URL('../assets-src/', import.meta.url));
const OUT = fileURLToPath(new URL('../src/assets/work/', import.meta.url));
const KEEP = ['danov', 'crng', 'klapp'];

await mkdir(OUT, { recursive: true });

for (const file of await readdir(SRC)) {
  const { name, ext } = parse(file);
  if (ext !== '.png' || !KEEP.includes(name)) continue;

  const target = join(OUT, `${name}.webp`);
  await sharp(join(SRC, file)).resize({ width: 1600 }).webp({ quality: 82 }).toFile(target);

  const before = (await stat(join(SRC, file))).size;
  const after = (await stat(target)).size;
  console.log(
    `${name.padEnd(8)} ${(before / 1024 / 1024).toFixed(1)} MB → ${(after / 1024).toFixed(0)} kB`,
  );
}
