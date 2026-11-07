import { argbFromHex, Hct } from '@material/material-color-utilities';
import { brandColors } from '@/registry/ds/lib/color-scheme';
import {
  dynamicSchemeCss,
  dynamicBootAttribute,
  dynamicThemeBootScript,
  removeBootStyles,
  seedsFromImage,
} from '@/registry/ds/lib/dynamic-color';

const seedTeal = '#0B8F6A';

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

it('quotes and escapes any element key', () => {
  const light = brandColors({ seed: seedTeal, mode: 'light' });
  const key = 'tenant "7" </style><b>';
  const css = dynamicSchemeCss({ seed: seedTeal, contrast: 'standard' }, { scope: 'element', key });
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

describe('seedsFromImage', () => {
  it('reads a Blob, an image URL, an image element and an ImageBitmap', async () => {
    const blob = await tealBlob();
    const fromBlob = await seedsFromImage(blob);
    expect(hueDistance(hue(fromBlob[0]), hue(seedTeal))).toBeLessThan(10);
    const fromBitmap = await seedsFromImage(await createImageBitmap(blob));
    expect(hueDistance(hue(fromBitmap[0]), hue(seedTeal))).toBeLessThan(10);
    const url = URL.createObjectURL(blob);
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
  it('rejects with an AbortError when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      seedsFromImage('/missing.png', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });

    const loading = new AbortController();
    const pending = seedsFromImage('/missing.png', { signal: loading.signal });
    loading.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
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
