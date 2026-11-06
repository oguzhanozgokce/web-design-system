import { argbFromHex, Hct } from '@material/material-color-utilities';
import { render } from 'vitest-browser-react';
import { useImageSeed } from '@/registry/ds/hooks/use-image-seed';

const seedTeal = '#0B8F6A';

async function tealBlob() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d')!;
  context.fillStyle = 'rgb(11 143 106)';
  context.fillRect(0, 0, 32, 32);
  return new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
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

  it('loads and ranks seeds from a file', async () => {
    const blob = await tealBlob();
    const screen = await render(<Probe source={blob} />);
    const probe = screen.getByTestId('probe');
    await expect.element(probe).toHaveAttribute('data-status', 'ready');
    const seed = probe.element().getAttribute('data-seed')!;
    const distance = Math.abs(
      Hct.fromInt(argbFromHex(seed)).hue - Hct.fromInt(argbFromHex(seedTeal)).hue,
    );
    expect(distance).toBeLessThan(10);
  });

  it('reports loading again when the source changes', async () => {
    const first = await tealBlob();
    const screen = await render(<Probe source={first} />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'ready');
    const second = await tealBlob();
    await screen.rerender(<Probe source={second} />);
    expect(screen.getByTestId('probe').element().getAttribute('data-status')).toBe('loading');
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'ready');
  });

  it('reports loading again when count or fallback change', async () => {
    const blob = await tealBlob();
    const screen = await render(<Probe source={blob} />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'ready');
    await screen.rerender(<Probe source={blob} count={1} />);
    expect(screen.getByTestId('probe').element().getAttribute('data-status')).toBe('loading');
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'ready');
    await expect.element(screen.getByTestId('probe')).toHaveTextContent('1');
  });

  it('reports ready with no seed for a grey image, and the fallback when given', async () => {
    const fallbackSeed = '#0B8F6A';
    const grey = await new Promise<Blob>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext('2d')!;
      context.fillStyle = 'rgb(128 128 128)';
      context.fillRect(0, 0, 16, 16);
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    const screen = await render(<Probe source={grey} />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'ready');
    expect(screen.getByTestId('probe').element().getAttribute('data-seed')).toBe('');
    await screen.rerender(<Probe source={grey} fallback={fallbackSeed} />);
    await expect
      .element(screen.getByTestId('probe'))
      .toHaveAttribute('data-seed', fallbackSeed.toLowerCase());
  });

  it('can unmount while loading', async () => {
    const screen = await render(<Probe source={await tealBlob()} />);
    await screen.unmount();
  });

  it('reports an error for an image that does not load', async () => {
    const screen = await render(<Probe source="/does-not-exist.png" />);
    await expect.element(screen.getByTestId('probe')).toHaveAttribute('data-status', 'error');
  });
});
