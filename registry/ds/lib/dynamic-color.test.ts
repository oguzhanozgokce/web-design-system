import { argbFromHex, Hct } from '@material/material-color-utilities';
import { brandColors, colorRoleNames } from '@/registry/ds/lib/color-scheme';
import {
  dynamicBootAttribute,
  dynamicSchemeCss,
  dynamicThemeBootScript,
  parseSeed,
  removeBootStyles,
  schemeKey,
  seedsFromImage,
  seedsFromImageData,
} from '@/registry/ds/lib/dynamic-color';

const seedTeal = '#0B8F6A';
const seedTealLower = '#0b8f6a';
const seedShort = '#ABC';
const seedShortExpanded = '#aabbcc';
const seedTooShort = '#12345';

function solidPixels(red: number, green: number, blue: number, alpha = 255, size = 16) {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let index = 0; index < data.length; index += 4) {
    data.set([red, green, blue, alpha], index);
  }
  return data;
}

function variedPixels() {
  const data = new Uint8ClampedArray(64 * 64 * 4);
  for (let index = 0; index < 64 * 64; index++) {
    const x = index % 64;
    const y = Math.floor(index / 64);
    data.set([(x * 4) % 256, (y * 4) % 256, ((x + y) * 3) % 256, 255], index * 4);
  }
  return data;
}

function hue(hex: string) {
  return Hct.fromInt(argbFromHex(hex)).hue;
}

function hueDistance(a: number, b: number) {
  const distance = Math.abs(a - b) % 360;
  return distance > 180 ? 360 - distance : distance;
}

async function canvasBlob(paint: (context: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;
  paint(context);
  return new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
}

const tealBlob = () =>
  canvasBlob((context) => {
    context.fillStyle = 'rgb(11 143 106)';
    context.fillRect(0, 0, 64, 64);
  });

function count(text: string, pattern: string) {
  return text.split(pattern).length - 1;
}

describe('parseSeed', () => {
  it('normalises six and three digit seeds, with or without a hash', () => {
    expect(parseSeed(seedTeal)).toBe(seedTealLower);
    expect(parseSeed(seedTeal.slice(1))).toBe(seedTealLower);
    expect(parseSeed(seedShort)).toBe(seedShortExpanded);
    expect(parseSeed(`  ${seedTeal}  `)).toBe(seedTealLower);
  });

  it('rejects anything that is not a hex seed, including other types', () => {
    for (const value of ['red', '', seedTooShort, 'rgb(0 0 0)', null, undefined, 42, {}]) {
      expect(parseSeed(value)).toBeNull();
    }
  });
});

describe('schemeKey', () => {
  it('is a stable CSS identifier that encodes every option', () => {
    const key = schemeKey({ seed: seedTeal, paletteStyle: 'vibrant', contrast: 'high' });
    expect(key).toBe(schemeKey({ seed: seedTealLower, paletteStyle: 'vibrant', contrast: 'high' }));
    expect(key).toMatch(/^s[0-9a-f]{6}-[a-z-]+$/);
    expect(key).not.toBe(schemeKey({ seed: seedTeal, paletteStyle: 'vibrant', mode: 'dark' }));
  });

  it('rejects options outside their sets', () => {
    expect(() => schemeKey({ seed: 'teal' })).toThrow(/Invalid seed/);
    expect(() => schemeKey({ seed: seedTeal, paletteStyle: 'loud' as never })).toThrow(/style/);
    expect(() => schemeKey({ seed: seedTeal, contrast: '</style>' as never })).toThrow(/contrast/);
    expect(() => schemeKey({ seed: seedTeal, mode: 'dim' as never })).toThrow(/mode/);
  });
});

describe('dynamicSchemeCss', () => {
  it('builds a scheme once and reuses it for every scope that shows it', () => {
    const options = { seed: seedTeal, paletteStyle: 'vibrant' as const };
    const target = { scope: 'element' as const, key: schemeKey(options) };
    const first = performance.now();
    const css = dynamicSchemeCss(options, target);
    const built = performance.now() - first;
    const again = performance.now();
    for (let index = 0; index < 50; index++) {
      expect(dynamicSchemeCss({ ...options }, { ...target })).toBe(css);
    }
    expect(performance.now() - again).toBeLessThan(built);
    expect(dynamicSchemeCss(options, { scope: 'root' })).not.toBe(css);
    expect(dynamicSchemeCss(options, { scope: 'element', key: 'other' })).toContain('"other"');
  });

  const light = brandColors({ seed: seedTeal, mode: 'light' });
  const dark = brandColors({ seed: seedTeal, mode: 'dark' });

  it('writes light-dark roles per contrast level plus a fallback for older browsers', () => {
    const key = schemeKey({ seed: seedTeal });
    const css = dynamicSchemeCss({ seed: seedTeal }, { scope: 'element', key });
    for (const role of colorRoleNames) {
      expect(count(css, `--${role}:light-dark(`)).toBe(4);
      expect(count(css, `--${role}:#`)).toBe(2);
    }
    expect(css).toContain(`--primary:light-dark(${light.primary},${dark.primary})`);
    expect(css).toContain('@supports (color: light-dark(red, red))');
    expect(css).toContain('@supports not (color: light-dark(red, red))');
    expect(css).toContain('@media (prefers-contrast: more)');
    expect(css).toContain(`:root[data-contrast=high] [data-ds-scheme="${key}"]`);
    expect(css).not.toMatch(/[<>]/);
  });

  it('writes one rule per browser generation for a pinned contrast and mode', () => {
    const css = dynamicSchemeCss(
      { seed: seedTeal, contrast: 'high', mode: 'dark' },
      { scope: 'element', key: 'k' },
    );
    const high = brandColors({ seed: seedTeal, mode: 'dark', contrast: 'high' });
    expect(count(css, '--primary:')).toBe(2);
    expect(css).toContain('color-scheme:dark');
    expect(css).toContain(`--primary:${high.primary}`);
    expect(css).not.toContain('@media');
  });

  it('quotes and escapes any element key', () => {
    const key = 'tenant "7" </style><b>';
    const css = dynamicSchemeCss(
      { seed: seedTeal, contrast: 'standard' },
      { scope: 'element', key },
    );
    expect(css).not.toMatch(/[<>]/);
    const style = document.createElement('style');
    style.textContent = css;
    const target = document.createElement('div');
    target.setAttribute('data-ds-scheme', key);
    document.head.append(style);
    document.body.append(target);
    try {
      expect(getComputedStyle(target).getPropertyValue('--primary')).toContain(light.primary);
    } finally {
      style.remove();
      target.remove();
    }
  });

  it('targets the root and the mode islands below it', () => {
    const islands = ':is(.light,.dark,[data-theme]):not([data-ds-scheme],[data-ds-scheme] *)';
    const css = dynamicSchemeCss({ seed: seedTeal }, { scope: 'root' });
    expect(css).toContain(`html:root,html:root ${islands}{`);
    expect(css).toContain(
      `html:root[data-contrast=medium],html:root[data-contrast=medium] ${islands}{`,
    );
    expect(css).toContain(
      `@media (prefers-contrast: more){html:root:not([data-contrast]),html:root:not([data-contrast]) ${islands}{`,
    );
    const pinned = dynamicSchemeCss({ seed: seedTeal, contrast: 'high' }, { scope: 'root' });
    expect(pinned).toContain(`html:root,html:root ${islands}{`);
  });

  it('throws for an element scope without a key', () => {
    expect(() => dynamicSchemeCss({ seed: seedTeal }, { scope: 'element', key: '' })).toThrow();
  });
});

describe('seedsFromImageData', () => {
  it('ranks the dominant colourful colour first', () => {
    const seeds = seedsFromImageData(solidPixels(11, 143, 106));
    expect(seeds.length).toBeGreaterThan(0);
    expect(hueDistance(hue(seeds[0]), hue(seedTeal))).toBeLessThan(10);
  });

  it('is deterministic', () => {
    const data = variedPixels();
    const first = seedsFromImageData(data);
    for (let run = 0; run < 3; run++) expect(seedsFromImageData(data)).toEqual(first);
  });

  it('leaves Math.random untouched', () => {
    const random = Math.random;
    seedsFromImageData(variedPixels());
    expect(Math.random).toBe(random);
  });

  it('returns nothing, or the fallback, for transparent and grey images alike', () => {
    const fallbackSeed = seedTeal;
    for (const data of [solidPixels(200, 30, 30, 0), solidPixels(128, 128, 128)]) {
      expect(seedsFromImageData(data)).toEqual([]);
      expect(seedsFromImageData(data, { fallback: fallbackSeed })).toEqual([seedTealLower]);
    }
  });

  it('rejects a fallback that is not a seed', () => {
    expect(() => seedsFromImageData(solidPixels(128, 128, 128), { fallback: 'teal' })).toThrow(
      /fallback/,
    );
  });

  it('returns distinct candidates, at most count', () => {
    const data = new Uint8ClampedArray(64 * 4 * 4);
    const colours = [
      [214, 64, 48],
      [32, 120, 214],
      [40, 170, 80],
      [230, 180, 30],
    ];
    for (let index = 0; index < 64 * 4; index++) {
      data.set([...colours[index % 4], 255], index * 4);
    }
    const seeds = seedsFromImageData(data, { count: 4 });
    expect(seeds.length).toBeGreaterThan(1);
    expect(seeds.length).toBeLessThanOrEqual(4);
    expect(new Set(seeds).size).toBe(seeds.length);
    expect(seedsFromImageData(data, { count: 0 }).length).toBe(1);
  });
});

describe('seedsFromImage', () => {
  it('reads a Blob', async () => {
    const seeds = await seedsFromImage(await tealBlob());
    expect(hueDistance(hue(seeds[0]), hue(seedTeal))).toBeLessThan(10);
  });

  it('reads an image URL and an image element', async () => {
    const url = URL.createObjectURL(await tealBlob());
    try {
      const fromUrl = await seedsFromImage(url);
      expect(hueDistance(hue(fromUrl[0]), hue(seedTeal))).toBeLessThan(10);
      const image = new Image();
      image.src = url;
      const fromElement = await seedsFromImage(image);
      expect(fromElement).toEqual(fromUrl);
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it('reads an ImageBitmap', async () => {
    const bitmap = await createImageBitmap(await tealBlob());
    const seeds = await seedsFromImage(bitmap);
    expect(hueDistance(hue(seeds[0]), hue(seedTeal))).toBeLessThan(10);
  });

  it('rejects with an AbortError when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      seedsFromImage('/missing.png', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects for an image that does not load', async () => {
    await expect(seedsFromImage('/does-not-exist.png')).rejects.toThrow(/Could not load/);
  });
});

describe('dynamicThemeBootScript', () => {
  afterEach(() => {
    localStorage.clear();
    removeBootStyles('ds-test-theme');
    removeBootStyles('ds-other-theme');
  });

  function runBoot(storageKey: string, nonce?: string) {
    const script = document.createElement('script');
    if (nonce) script.nonce = nonce;
    script.textContent = dynamicThemeBootScript(storageKey);
    document.head.append(script);
    script.remove();
  }

  it('paints the cached CSS, tagged with its key and the script nonce', () => {
    localStorage.setItem('ds-test-theme', 'html:root{--ds-boot-probe:1}');
    runBoot('ds-test-theme', 'abc123');
    const style = document.querySelector<HTMLStyleElement>(`style[${dynamicBootAttribute}]`);
    expect(style?.getAttribute(dynamicBootAttribute)).toBe('ds-test-theme');
    expect(style?.nonce).toBe('abc123');
    expect(getComputedStyle(document.documentElement).getPropertyValue('--ds-boot-probe')).toBe(
      '1',
    );
  });

  it('removes only the styles of one key', () => {
    localStorage.setItem('ds-test-theme', 'html:root{--ds-boot-a:1}');
    localStorage.setItem('ds-other-theme', 'html:root{--ds-boot-b:1}');
    runBoot('ds-test-theme');
    runBoot('ds-other-theme');
    removeBootStyles('ds-test-theme');
    const keys = [...document.querySelectorAll(`style[${dynamicBootAttribute}]`)].map((style) =>
      style.getAttribute(dynamicBootAttribute),
    );
    expect(keys).toEqual(['ds-other-theme']);
  });

  it('does nothing without a cache and escapes the key', () => {
    const script = dynamicThemeBootScript('</script><script>alert(1)</script>');
    expect(script).not.toContain('</script>');
    new Function(script)();
    expect(document.querySelector(`style[${dynamicBootAttribute}]`)).toBeNull();
  });
});
