import { argbFromHex, Hct } from '@material/material-color-utilities';
import { brandColors, colorRoleNames } from '@/registry/ds/lib/color-scheme';
import {
  dynamicSchemeCss,
  parseSeed,
  schemeKey,
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
    expect(() => dynamicSchemeCss({ seed: seedTeal }, { scope: 'element', key: '' })).toThrow();
  });
});

describe('dynamicSchemeCss', () => {
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
});

describe('seedsFromImageData', () => {
  it('ranks the dominant colourful colour first', () => {
    const seeds = seedsFromImageData(solidPixels(11, 143, 106));
    expect(seeds.length).toBeGreaterThan(0);
    expect(hueDistance(hue(seeds[0]), hue(seedTeal))).toBeLessThan(10);
  });

  it('is deterministic', () => {
    const random = Math.random;
    const data = variedPixels();
    const first = seedsFromImageData(data);
    for (let run = 0; run < 3; run++) expect(seedsFromImageData(data)).toEqual(first);
    expect(Math.random).toBe(random);
  });

  it('returns nothing, or the fallback, for transparent and grey images alike', () => {
    const fallbackSeed = seedTeal;
    for (const data of [solidPixels(200, 30, 30, 0), solidPixels(128, 128, 128)]) {
      expect(seedsFromImageData(data)).toEqual([]);
      expect(seedsFromImageData(data, { fallback: fallbackSeed })).toEqual([seedTealLower]);
    }
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
