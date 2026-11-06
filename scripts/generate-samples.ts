import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

interface Scene {
  name: string;
  sky: [string, string];
  blobs: { x: number; y: number; r: number; color: string }[];
  ground: string;
}

const scenes: Scene[] = [
  {
    name: 'dune',
    sky: ['#f6c48a', '#e2733f'],
    blobs: [
      { x: 0.72, y: 0.3, r: 0.12, color: 'rgba(255,236,190,0.95)' },
      { x: 0.2, y: 0.75, r: 0.55, color: 'rgba(196,96,52,0.9)' },
      { x: 0.8, y: 0.85, r: 0.5, color: 'rgba(150,62,38,0.85)' },
    ],
    ground: 'rgba(122,48,30,0.9)',
  },
  {
    name: 'lagoon',
    sky: ['#9fe3dc', '#1f8a9a'],
    blobs: [
      { x: 0.3, y: 0.35, r: 0.3, color: 'rgba(210,250,240,0.7)' },
      { x: 0.75, y: 0.7, r: 0.5, color: 'rgba(12,98,128,0.9)' },
      { x: 0.15, y: 0.9, r: 0.45, color: 'rgba(8,70,96,0.85)' },
    ],
    ground: 'rgba(6,52,74,0.9)',
  },
  {
    name: 'moss',
    sky: ['#d9e8a4', '#5f8f3a'],
    blobs: [
      { x: 0.65, y: 0.25, r: 0.18, color: 'rgba(250,240,160,0.9)' },
      { x: 0.25, y: 0.7, r: 0.5, color: 'rgba(58,110,40,0.9)' },
      { x: 0.85, y: 0.8, r: 0.45, color: 'rgba(34,78,32,0.9)' },
    ],
    ground: 'rgba(24,56,26,0.9)',
  },
  {
    name: 'dusk',
    sky: ['#f3b6d6', '#6b3fa0'],
    blobs: [
      { x: 0.35, y: 0.32, r: 0.14, color: 'rgba(255,214,232,0.95)' },
      { x: 0.7, y: 0.72, r: 0.55, color: 'rgba(122,52,150,0.9)' },
      { x: 0.1, y: 0.85, r: 0.5, color: 'rgba(70,32,110,0.9)' },
    ],
    ground: 'rgba(42,20,72,0.92)',
  },
];

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public/samples');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
for (const scene of scenes) {
  const dataUrl = await page.evaluate((scene: Scene) => {
    const width = 960;
    const height = 640;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, scene.sky[0]);
    sky.addColorStop(1, scene.sky[1]);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    context.filter = 'blur(40px)';
    for (const blob of scene.blobs) {
      const gradient = context.createRadialGradient(
        blob.x * width,
        blob.y * height,
        0,
        blob.x * width,
        blob.y * height,
        blob.r * width,
      );
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }
    context.filter = 'blur(6px)';
    context.fillStyle = scene.ground;
    context.beginPath();
    context.moveTo(0, height * 0.78);
    for (let x = 0; x <= width; x += 24) {
      context.lineTo(x, height * (0.76 + 0.05 * Math.sin(x / 90) + 0.02 * Math.sin(x / 23)));
    }
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.fill();
    context.filter = 'none';
    const image = context.getImageData(0, 0, width, height);
    let state = 0x9e3779b9;
    for (let index = 0; index < image.data.length; index += 4) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const shift = Math.round(((state >>> 0) / 4294967296 - 0.5) * 12);
      image.data[index] += shift;
      image.data[index + 1] += shift;
      image.data[index + 2] += shift;
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.82);
  }, scene);
  const file = path.join(outDir, `${scene.name}.jpg`);
  await writeFile(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(`samples: ${path.relative(root, file)}`);
}
await browser.close();
