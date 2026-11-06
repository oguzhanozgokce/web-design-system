import fixture from '@/test/fixtures/materialkolor-6.0.0.json';
import {
  brandColors,
  type BrandColors,
  type ColorMode,
  type ContrastLevel,
  type PaletteStyle,
} from '@/registry/ds/lib/color-scheme';

function web(key: string) {
  const [seed, style, mode, contrast] = key.split('|');
  return brandColors({
    seed,
    style: style as PaletteStyle,
    mode: mode as ColorMode,
    contrast: contrast as ContrastLevel,
  }) as Record<string, string> & BrandColors;
}

describe('brandColors parity with MaterialKolor 6.0.0', () => {
  it.each(Object.keys(fixture.matching))('matches %s', (key) => {
    const roles = fixture.matching[key as keyof typeof fixture.matching];
    const colors = web(key);
    for (const [role, value] of Object.entries(roles)) expect(colors[role], role).toBe(value);
  });

  it.each(Object.keys(fixture.knownDifferences))(
    'still differs for %s, where npm lags MaterialKolor',
    (key) => {
      const roles = fixture.knownDifferences[key as keyof typeof fixture.knownDifferences];
      const colors = web(key);
      expect(Object.entries(roles).some(([role, value]) => colors[role] !== value)).toBe(true);
    },
  );
});
