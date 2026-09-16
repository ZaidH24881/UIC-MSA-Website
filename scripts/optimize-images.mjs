import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const assets = path.resolve('public/assets');
const names = ['hero-community', 'community-together', 'prayer-together', 'campus-community'];
for (const name of names) {
  const input = await readFile(path.join(assets, `${name}.jpg`));
  for (const width of [640, 1200, 1800])
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(assets, `${name}-${width}.webp`));
  await sharp(input)
    .resize({ width: 1800, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(assets, `${name}.jpg`));
}
await sharp(path.join(assets, 'msa-logo.png'))
  .trim()
  .resize(160, 160, { fit: 'inside' })
  .webp({ quality: 88 })
  .toFile(path.join(assets, 'msa-logo.webp'));
console.log('Optimized four community photographs and the original MSA logo.');
