import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Sparkline } from '@/registry/ds/ui/sparkline';

const rising = [12, 14, 13, 17, 16, 19, 22, 21, 25, 27];

const still = { provider: { motion: 'reduced' as const } };

function endDot(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="end-dot"]');
}

describe('Sparkline', () => {
  it('is a named image described by its trend, with a hidden data table', async () => {
    const screen = await renderWithDS(
      <Sparkline aria-label="Sign-ups, last 10 days" data={rising} />,
      still,
    );
    const image = screen.getByRole('img', { name: 'Sign-ups, last 10 days' });
    await expect
      .element(image)
      .toHaveAccessibleDescription('From 12 to 27, lowest 12, highest 27.');
    const table = screen.getByRole('table', { name: 'Data for Sign-ups, last 10 days' });
    expect(table.element().querySelectorAll('tbody tr')).toHaveLength(10);
    const first = [...table.element().querySelectorAll('tbody tr')[0].children].map(
      (cell) => cell.textContent,
    );
    expect(first).toEqual(['1', '12']);
    expect(image.element().querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('labels table rows with categories when given', async () => {
    const screen = await renderWithDS(
      <Sparkline
        aria-label="Visits"
        data={[3, 5]}
        categories={[new Date(2026, 8, 7), new Date(2026, 8, 14)]}
      />,
      still,
    );
    const rows = screen.getByRole('table').element().querySelectorAll('tbody th');
    expect(rows[0].textContent).toBe('Sep 7, 2026');
  });

  it('draws a line, an optional area and an end dot at the last value', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <Sparkline aria-label="Line" data={rising} className="h-10 w-40" />
        <Sparkline aria-label="Area" data={rising} variant="area" showEndDot={false} />
      </div>,
      still,
    );
    const [line, area] = screen.container.querySelectorAll<HTMLElement>('[data-slot="sparkline"]');
    expect(line.getBoundingClientRect().width).toBe(160);
    expect(line.querySelector('[data-slot="area"]')).toBeNull();
    expect(area.querySelector('[data-slot="area"]')).not.toBeNull();
    expect(area.querySelector('[data-slot="end-dot"]')).toBeNull();
    const dot = endDot(line)!.getBoundingClientRect();
    const box = line.getBoundingClientRect();
    expect(dot.left + dot.width / 2).toBeCloseTo(box.right, 0);
    expect(dot.top + dot.height / 2).toBeLessThan(box.top + box.height / 2);
  });

  it('skips missing values and survives flat or empty data', async () => {
    const screen = await renderWithDS(
      <div>
        <Sparkline aria-label="Gaps" data={[4, null, 6, 7]} />
        <Sparkline aria-label="Flat" data={[5, 5, 5]} />
        <Sparkline aria-label="Empty" data={[]} />
      </div>,
      still,
    );
    const [gaps, flat, empty] =
      screen.container.querySelectorAll<HTMLElement>('[data-slot="sparkline"]');
    expect(gaps.querySelector('[data-slot="line"]')!.getAttribute('d')!.match(/M/g)).toHaveLength(
      2,
    );
    const flatPath = flat.querySelector('[data-slot="line"]')!.getAttribute('d')!;
    expect(flatPath.startsWith('M0,50')).toBe(true);
    expect(flatPath.endsWith(',1000,50')).toBe(true);
    const ys = flatPath
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number)
      .filter((_, index) => index % 2 === 1);
    expect(new Set(ys)).toEqual(new Set([50]));
    expect(empty.querySelector('[data-slot="end-dot"]')).toBeNull();
    await expect
      .element(screen.getByRole('img', { name: 'Empty' }))
      .toHaveAccessibleDescription('No data');
  });

  it('runs right to left in RTL unless pinned', async () => {
    const screen = await renderWithDS(
      <div>
        <Sparkline aria-label="Mirrored" data={rising} />
        <Sparkline aria-label="Pinned" data={rising} categoryDirection="ltr" />
      </div>,
      { ...still, locale: 'ar' },
    );
    const [mirrored, pinned] =
      screen.container.querySelectorAll<HTMLElement>('[data-slot="sparkline"]');
    expect(mirrored.querySelector('g')!.getAttribute('transform')).toBe('matrix(-1 0 0 1 1000 0)');
    const dot = endDot(mirrored)!.getBoundingClientRect();
    expect(dot.left + dot.width / 2).toBeCloseTo(mirrored.getBoundingClientRect().left, 0);
    expect(pinned.getAttribute('dir')).toBe('ltr');
    const pinnedDot = endDot(pinned)!.getBoundingClientRect();
    expect(pinnedDot.left + pinnedDot.width / 2).toBeCloseTo(
      pinned.getBoundingClientRect().right,
      0,
    );
  });

  it('reveals from the start only when motion is allowed', async () => {
    const animated = await renderWithDS(<Sparkline aria-label="Animated" data={rising} />, {
      provider: { motion: 'system' },
    });
    const figure = animated.getByRole('img', { name: 'Animated' }).element() as HTMLElement;
    expect(figure.style.transition).toContain('clip-path 700ms');
    await expect.poll(() => figure.style.clipPath).toBe('inset(-10%)');
    const quiet = await renderWithDS(<Sparkline aria-label="Quiet" data={rising} />, still);
    const calm = quiet.getByRole('img', { name: 'Quiet' }).element() as HTMLElement;
    expect(calm.style.clipPath).toBe('');
  });

  it('formats its summary with the value format and the labels', async () => {
    const screen = await renderWithDS(
      <Sparkline
        aria-label="Uptime"
        data={[0.991, 0.998]}
        valueFormatOptions={{ style: 'percent', maximumFractionDigits: 1 }}
        labels={{ trend: '{first} → {last} (en düşük {min}, en yüksek {max})' }}
      />,
      still,
    );
    await expect
      .element(screen.getByRole('img', { name: 'Uptime' }))
      .toHaveAccessibleDescription('99.1% → 99.8% (en düşük 99.1%, en yüksek 99.8%)');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex gap-4 bg-surface-raised p-4">
          <Sparkline aria-label="Visits" data={rising} />
          <Sparkline aria-label="Errors" data={rising} variant="area" color="error" />
          <Sparkline aria-label="Uptime" data={rising} color="success" curve="linear" />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
