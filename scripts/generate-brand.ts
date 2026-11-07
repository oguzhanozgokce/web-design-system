import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { brandMarkPath } from '../lib/brand';

const root = new URL('../', import.meta.url);
const tokens = JSON.parse(await readFile(new URL('tokens/tokens.json', root), 'utf8'));
const roles = tokens.color.light.standard;
const background = roles['primary-solid'].$value;
const foreground = roles['on-primary-solid'].$value;
const drawing = `<g fill="${foreground}" fill-rule="evenodd" transform="translate(3.2 3.2) scale(1.2)"><path d="${brandMarkPath}"/></g>`;
const svg = (radius: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${background}"/>${drawing}</svg>\n`;
const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 48 48" fill="${background}" fill-rule="evenodd"><path d="${brandMarkPath}"/></svg>\n`;

await mkdir(new URL('public/brand/', root), { recursive: true });
await writeFile(new URL('public/brand/mark.svg', root), mark);
await sharp(Buffer.from(mark))
  .png()
  .toFile(fileURLToPath(new URL('public/brand/mark.png', root)));
await writeFile(new URL('public/favicon.svg', root), svg(18));
await sharp(Buffer.from(svg(18)))
  .png()
  .toFile(fileURLToPath(new URL('public/favicon.png', root)));
await sharp(Buffer.from(svg(0)))
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL('public/apple-touch-icon.png', root)));

console.log('brand: transparent mark, 96px favicon and 180px touch icon from one path and palette');
