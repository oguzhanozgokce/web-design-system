import {
  argbFromHex,
  argbFromRgb,
  hexFromArgb,
  QuantizerCelebi,
  Score,
} from '@material/material-color-utilities';
import {
  brandColors,
  colorRoleNames,
  type BrandColors,
  type ColorMode,
  type ContrastLevel,
  type PaletteStyle,
  type SurfaceStyle,
} from '@/registry/ds/lib/color-scheme';

export type DynamicContrast = ContrastLevel | 'auto';

export interface DynamicSchemeOptions {
  seed: string;
  paletteStyle?: PaletteStyle;
  contrast?: DynamicContrast;
  mode?: ColorMode;
  surfaces?: SurfaceStyle;
}

export type DynamicScope = { scope: 'root' } | { scope: 'element'; key: string };

export interface SeedExtractionOptions {
  count?: number;
  fallback?: string;
  maxSize?: number;
  signal?: AbortSignal;
}

export type ImageSeedSource = string | Blob | HTMLImageElement | ImageBitmap;

export const paletteStyles: PaletteStyle[] = [
  'tonal-spot',
  'vibrant',
  'expressive',
  'fidelity',
  'neutral',
  'monochrome',
];

export const dynamicContrasts: DynamicContrast[] = ['auto', 'standard', 'medium', 'high'];

export const dynamicBootAttribute = 'data-ds-boot';

const colorModes: ColorMode[] = ['light', 'dark'];
const seedPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const supportsLightDark = '(color: light-dark(red, red))';
const darkMatch = ':is(.dark, [data-theme=dark])';
const quantizerSeed = 0x42688;

export function parseSeed(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(seedPattern);
  if (!match) return null;
  const digits =
    match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
  return `#${digits.toLowerCase()}`;
}

function resolveOptions({ seed, paletteStyle, contrast, mode, surfaces }: DynamicSchemeOptions) {
  const parsed = parseSeed(seed);
  if (!parsed) throw new Error(`Invalid seed colour: ${String(seed)}`);
  const style = paletteStyle ?? 'tonal-spot';
  if (!paletteStyles.includes(style)) throw new Error(`Unknown palette style: ${String(style)}`);
  const level = contrast ?? 'auto';
  if (!dynamicContrasts.includes(level)) throw new Error(`Unknown contrast: ${String(level)}`);
  if (mode !== undefined && !colorModes.includes(mode)) {
    throw new Error(`Unknown mode: ${String(mode)}`);
  }
  const surfaceStyle = surfaces ?? 'neutral';
  if (surfaceStyle !== 'neutral' && surfaceStyle !== 'tinted') {
    throw new Error(`Unknown surfaces: ${String(surfaceStyle)}`);
  }
  return { seed: parsed, paletteStyle: style, contrast: level, mode, surfaces: surfaceStyle };
}

export function schemeKey(options: DynamicSchemeOptions) {
  const { seed, paletteStyle, contrast, mode, surfaces } = resolveOptions(options);
  return `s${seed.slice(1)}-${paletteStyle}-${contrast}-${mode ?? 'page'}-${surfaces}`;
}

function cssString(value: string) {
  const escaped = value
    .replace(/["\\]/g, '\\$&')
    .replace(/[^\x20-\x7e]|[<>]/gu, (char) => `\\${char.codePointAt(0)!.toString(16)} `);
  return `"${escaped}"`;
}

function single(colors: BrandColors) {
  return colorRoleNames.map((role) => `--${role}:${colors[role]}`).join(';');
}

function lightDark(light: BrandColors, dark: BrandColors) {
  return colorRoleNames
    .map((role) => `--${role}:light-dark(${light[role]},${dark[role]})`)
    .join(';');
}

const schemeCssCache = new Map<string, string>();
const schemeCssCacheSize = 32;

export function dynamicSchemeCss(options: DynamicSchemeOptions, target: DynamicScope) {
  const id = `${schemeKey(options)} ${target.scope === 'root' ? 'root' : `element ${target.key}`}`;
  const cached = schemeCssCache.get(id);
  if (cached !== undefined) {
    schemeCssCache.delete(id);
    schemeCssCache.set(id, cached);
    return cached;
  }
  const css = buildSchemeCss(options, target);
  schemeCssCache.set(id, css);
  if (schemeCssCache.size > schemeCssCacheSize) {
    schemeCssCache.delete(schemeCssCache.keys().next().value!);
  }
  return css;
}

function buildSchemeCss(options: DynamicSchemeOptions, target: DynamicScope) {
  const { seed, paletteStyle, contrast, mode, surfaces } = resolveOptions(options);
  const isRoot = target.scope === 'root';
  if (!isRoot && !target.key) throw new Error('An element scope needs a key');

  const cache = new Map<string, BrandColors>();
  const colors = (colorMode: ColorMode, level: ContrastLevel) => {
    const id = `${colorMode}-${level}`;
    let result = cache.get(id);
    if (!result) {
      result = brandColors({
        seed,
        mode: colorMode,
        style: paletteStyle,
        contrast: level,
        surfaces,
      });
      cache.set(id, result);
    }
    return result;
  };
  const both = (level: ContrastLevel) => lightDark(colors('light', level), colors('dark', level));
  const colorScheme = mode ? `color-scheme:${mode};` : '';
  const self = isRoot ? 'html:root' : `[data-ds-scheme=${cssString(target.key)}]`;
  const islands = (root: string, match: string) =>
    `${root} :is(${match}):not([data-ds-scheme],[data-ds-scheme] *)`;
  const anyMode = '.light,.dark,[data-theme]';
  const when = (condition: string) =>
    isRoot
      ? `html:root${condition},${islands(`html:root${condition}`, anyMode)}`
      : `:root${condition} ${self}`;
  const selfAndIslands = isRoot ? when('') : self;

  const modern =
    contrast === 'auto'
      ? [
          `${selfAndIslands}{${colorScheme}${both('standard')}}`,
          `${when('[data-contrast=medium]')}{${both('medium')}}`,
          `${when('[data-contrast=high]')}{${both('high')}}`,
          `@media (prefers-contrast: more){${when(':not([data-contrast])')}{${both('high')}}}`,
        ]
      : [`${selfAndIslands}{${colorScheme}${both(contrast)}}`];

  const level = contrast === 'auto' ? 'standard' : contrast;
  const lightSelf = isRoot
    ? `html:root,${islands('html:root', ".light,[data-theme='light']")}`
    : self;
  const darkSelf = isRoot
    ? `html:root${darkMatch},${islands('html:root', ".dark,[data-theme='dark']")}`
    : `${darkMatch} ${self}`;
  const legacy = mode
    ? [`${self}{${single(colors(mode, level))}}`]
    : [
        `${lightSelf}{${single(colors('light', level))}}`,
        `${darkSelf}{${single(colors('dark', level))}}`,
      ];

  return [
    `@supports ${supportsLightDark}{${modern.join('')}}`,
    `@supports not ${supportsLightDark}{${legacy.join('')}}`,
  ].join('\n');
}

function seededRandom(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function quantize(pixels: number[]) {
  const random = Math.random;
  Math.random = seededRandom(quantizerSeed);
  try {
    return QuantizerCelebi.quantize(pixels, 128);
  } finally {
    Math.random = random;
  }
}

function resolveFallback(fallback: string | undefined) {
  if (fallback === undefined || fallback === '') return null;
  const parsed = parseSeed(fallback);
  if (!parsed) throw new Error(`Invalid fallback seed: ${fallback}`);
  return parsed;
}

export function seedsFromImageData(
  data: ArrayLike<number>,
  { count = 4, fallback }: Pick<SeedExtractionOptions, 'count' | 'fallback'> = {},
) {
  const fallbackSeed = resolveFallback(fallback);
  const pixels: number[] = [];
  for (let index = 0; index + 3 < data.length; index += 4) {
    if (data[index + 3] < 255) continue;
    pixels.push(argbFromRgb(data[index], data[index + 1], data[index + 2]));
  }
  const empty = fallbackSeed ? [fallbackSeed] : [];
  if (!pixels.length) return empty;
  const population = quantize(pixels);
  const ranked = Score.score(population, {
    desired: Math.max(1, Math.floor(count)),
    filter: true,
    ...(fallbackSeed ? { fallbackColorARGB: argbFromHex(fallbackSeed) } : {}),
  });
  const usable = ranked.filter((argb) => population.has(argb));
  return usable.length ? usable.map((argb) => hexFromArgb(argb)) : empty;
}

function abortError() {
  return new DOMException('Seed extraction was aborted', 'AbortError');
}

async function loadImage(source: string, signal?: AbortSignal) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';
  image.src = source;
  await new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      image.src = '';
      reject(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    image
      .decode()
      .then(resolve, () => reject(new Error(`Could not load image ${source}`)))
      .finally(() => signal?.removeEventListener('abort', onAbort));
  });
  return image;
}

async function decodeBlob(blob: Blob, maxSize: number) {
  try {
    return await createImageBitmap(blob, { resizeWidth: maxSize, resizeQuality: 'medium' });
  } catch {
    return createImageBitmap(blob);
  }
}

async function toDrawable(source: ImageSeedSource, maxSize: number, signal?: AbortSignal) {
  if (typeof source === 'string') return loadImage(source, signal);
  if (source instanceof Blob) return decodeBlob(source, maxSize);
  if (source instanceof HTMLImageElement && !source.complete) await source.decode();
  return source;
}

function readPixels(drawable: HTMLImageElement | ImageBitmap, maxSize: number) {
  const width = drawable instanceof HTMLImageElement ? drawable.naturalWidth : drawable.width;
  const height = drawable instanceof HTMLImageElement ? drawable.naturalHeight : drawable.height;
  if (!width || !height) throw new Error('The image has no pixels');
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas =
    typeof OffscreenCanvas === 'undefined'
      ? Object.assign(document.createElement('canvas'), {
          width: targetWidth,
          height: targetHeight,
        })
      : new OffscreenCanvas(targetWidth, targetHeight);
  const context = canvas.getContext('2d', { willReadFrequently: true }) as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error('Canvas 2D is not available');
  context.drawImage(drawable, 0, 0, targetWidth, targetHeight);
  return context.getImageData(0, 0, targetWidth, targetHeight).data;
}

export async function seedsFromImage(
  source: ImageSeedSource,
  { count = 4, fallback, maxSize = 128, signal }: SeedExtractionOptions = {},
) {
  resolveFallback(fallback);
  if (signal?.aborted) throw abortError();
  const drawable = await toDrawable(source, maxSize, signal);
  const owned = source instanceof Blob && drawable instanceof ImageBitmap;
  try {
    if (signal?.aborted) throw abortError();
    return seedsFromImageData(readPixels(drawable, maxSize), { count, fallback });
  } finally {
    if (owned) drawable.close();
  }
}

export function dynamicThemeBootScript(storageKey: string) {
  const key = JSON.stringify(storageKey).replace(/</g, '\\u003c');
  const attribute = JSON.stringify(dynamicBootAttribute);
  return `(function(){try{var c=localStorage.getItem(${key});if(!c)return;var s=document.createElement("style");s.setAttribute(${attribute},${key});var n=document.currentScript&&document.currentScript.nonce;if(n)s.nonce=n;s.textContent=c;document.head.appendChild(s)}catch(e){}})()`;
}

export function removeBootStyles(storageKey: string) {
  if (typeof document === 'undefined') return;
  for (const style of document.querySelectorAll(`style[${dynamicBootAttribute}]`)) {
    if (style.getAttribute(dynamicBootAttribute) === storageKey) style.remove();
  }
}
