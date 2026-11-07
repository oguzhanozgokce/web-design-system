import { argbFromHex, Hct } from '@material/material-color-utilities';
import { render } from 'vitest-browser-react';
import { useImageSeed } from '@/registry/ds/hooks/use-image-seed';

const seedTeal = '#0B8F6A';

async function solidBlob(fill: string, size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  context.fillStyle = fill;
  context.fillRect(0, 0, size, size);
  return new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
}

const tealBlob = () => solidBlob('rgb(11 143 106)');
const redBlob = () => solidBlob('rgb(200 30 40)');

function hueDistance(seed: string, reference: string) {
  return Math.abs(Hct.fromInt(argbFromHex(seed)).hue - Hct.fromInt(argbFromHex(reference)).hue);
}

function Probe({
  source,
  count,
  fallback,
}: {
  source: string | Blob | null;
  count?: number;
  fallback?: string;
}) {
  const { seed, seeds, status, error } = useImageSeed(source, { count, fallback });
  return (
    <output data-testid="probe" data-status={status} data-seed={seed ?? ''}>
      {seeds.length} {error ? 'error' : ''}
    </output>
  );
}

describe('useImageSeed', () => {
  it('is idle without a source', async () => {
    const screen = await render(<Probe source={null} />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'idle');
  });

  it('reports loading again when the source changes', async () => {
    const screen = await render(<Probe source={await redBlob()} />);
    const probe = screen.getByTestId('probe');
    await expect.element(probe).toHaveAttribute('data-status', 'ready');

    await screen.rerender(<Probe source={await tealBlob()} />);
    expect(probe.element().getAttribute('data-status')).toBe('loading');
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    expect(hueDistance(probe.element().getAttribute('data-seed')!, seedTeal)).toBeLessThan(10);

    const staleRed = await redBlob();
    const latestTeal = await tealBlob();
    await screen.rerender(<Probe source={staleRed} />);
    await screen.rerender(<Probe source={latestTeal} />);
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(probe.element().getAttribute('data-status')).toBe('ready');
    expect(hueDistance(probe.element().getAttribute('data-seed')!, seedTeal)).toBeLessThan(10);
  });

  it('reports loading again when count or fallback change', async () => {
    const blob = await tealBlob();
    const screen = await render(<Probe source={blob} />);
    const probe = screen.getByTestId('probe');
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    await screen.rerender(<Probe source={blob} count={1} />);
    expect(probe.element().getAttribute('data-status')).toBe('loading');
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    await expect.element(probe).toHaveTextContent('1');

    const grey = await solidBlob('rgb(128 128 128)', 16);
    await screen.rerender(<Probe source={grey} />);
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    expect(probe.element().getAttribute('data-seed')).toBe('');
    await screen.rerender(<Probe source={grey} fallback={seedTeal} />);
    expect(probe.element().getAttribute('data-status')).toBe('loading');
    await expect.element(probe).toHaveAttribute('data-seed', seedTeal.toLowerCase());
  });

  it('reports an error for an image that does not load', async () => {
    const screen = await render(<Probe source="/does-not-exist.png" />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'error');
  });
});
