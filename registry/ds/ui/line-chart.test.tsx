import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import type { ChartSeries } from '@/registry/ds/ui/chart';
import { LineChart, type LineChartProps } from '@/registry/ds/ui/line-chart';

interface Week {
  week: string;
  thisYear: number | null;
  lastYear: number;
}

const data: Week[] = [
  { week: 'W1', thisYear: 420, lastYear: 310 },
  { week: 'W2', thisYear: 446, lastYear: 302 },
  { week: 'W3', thisYear: null, lastYear: 318 },
  { week: 'W4', thisYear: 498, lastYear: 296 },
  { week: 'W5', thisYear: 530, lastYear: 305 },
];

const series: ChartSeries<Week>[] = [
  { id: 'this-year', label: 'This year', value: 'thisYear' },
  { id: 'last-year', label: 'Last year', value: 'lastYear', color: 'neutral', lineStyle: 'dashed' },
];

const still = { provider: { motion: 'reduced' as const } };

function Devices(props: Partial<LineChartProps<Week>>) {
  return (
    <div className="w-[480px] bg-surface-raised p-4">
      <LineChart
        aria-label="Weekly devices"
        data={data}
        category="week"
        series={series}
        {...props}
      />
    </div>
  );
}

function line(container: HTMLElement, id: string) {
  return container.querySelector<SVGPathElement>(`[data-slot="line"][data-series="${id}"]`)!;
}

function crosshair(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="crosshair"]');
}

describe('LineChart', () => {
  it('draws one non-scaling path per series and breaks it at missing values', async () => {
    const screen = await renderWithDS(<Devices />, still);
    const plot = screen.getByRole('group', { name: 'Weekly devices' });
    await expect.element(plot).toHaveAttribute('aria-roledescription', 'chart');
    const current = line(screen.container, 'this-year');
    const previous = line(screen.container, 'last-year');
    expect(current.getAttribute('d')!.match(/M/g)).toHaveLength(2);
    expect(previous.getAttribute('d')!.match(/M/g)).toHaveLength(1);
    expect(previous.getAttribute('d')).toContain('C');
    expect(current.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    expect(previous.getAttribute('stroke-dasharray')).toBe('5 5');
    expect(getComputedStyle(current).strokeWidth).toBe('2px');
    const table = screen.getByRole('table', { name: 'Data for Weekly devices' });
    const third = [...table.element().querySelectorAll('tbody tr')[2].children].map(
      (cell) => cell.textContent,
    );
    expect(third).toEqual(['W3', '–', '318']);
    const legend = screen.getByRole('list', { name: 'Legend' });
    const markers = legend.element().querySelectorAll('[data-slot="marker"]');
    expect(getComputedStyle(markers[1]).backgroundImage).toContain('repeating-linear-gradient');
  });

  it('switches curves', async () => {
    const screen = await renderWithDS(
      <div>
        <Devices curve="linear" />
        <Devices curve="step" />
      </div>,
      still,
    );
    const [linear, step] = screen.container.querySelectorAll<SVGPathElement>(
      '[data-slot="line"][data-series="last-year"]',
    );
    expect(linear.getAttribute('d')).not.toContain('C');
    expect(linear.getAttribute('d')).toContain('L');
    expect(step.getAttribute('d')).toContain('H');
    expect(step.getAttribute('d')).toContain('V');
  });

  it('moves a crosshair, the active dots and the tooltip with the arrow keys', async () => {
    const screen = await renderWithDS(<Devices />, still);
    const plot = screen.getByRole('group', { name: 'Weekly devices' }).element() as HTMLElement;
    plot.focus();
    await userEvent.keyboard('{ArrowRight}');
    const guide = crosshair(screen.container)!;
    await expect.element(guide).toHaveAttribute('data-visible');
    const plotRect = plot.getBoundingClientRect();
    const centre = () => {
      const rect = guide.getBoundingClientRect();
      return rect.left + rect.width / 2;
    };
    expect(centre()).toBeCloseTo(plotRect.left, 0);
    const live = screen.container.querySelector('[data-slot="chart-live"]')!;
    expect(live.textContent).toBe('W1: This year 420, Last year 310');

    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(live.textContent).toBe('W3: Last year 318');
    const dots = screen.container.querySelectorAll('[data-slot="active-dot"]');
    expect(dots).toHaveLength(1);
    expect(centre()).toBeCloseTo(plotRect.left + plotRect.width / 2, 0);
    const layer = screen.container.querySelector<HTMLElement>('[data-slot="tooltip-layer"]')!;
    expect(layer.textContent).toBe('W3This year–Last year318');

    await userEvent.keyboard('{End}');
    expect(centre()).toBeCloseTo(plotRect.right, 0);
    await userEvent.keyboard('{Escape}');
    await expect.element(guide).not.toHaveAttribute('data-visible');
  });

  it('snaps the pointer to the nearest point', async () => {
    const screen = await renderWithDS(<Devices />, still);
    const plot = screen.getByRole('group', { name: 'Weekly devices' }).element() as HTMLElement;
    const rect = plot.getBoundingClientRect();
    await page.elementLocator(plot).hover({ position: { x: rect.width * 0.7, y: 10 } });
    const layer = screen.container.querySelector<HTMLElement>('[data-slot="tooltip-layer"]')!;
    await expect.element(layer).toHaveAttribute('data-visible');
    expect(layer.textContent).toContain('W4');
    const tip = layer.getBoundingClientRect();
    const guide = crosshair(screen.container)!.getBoundingClientRect();
    expect(tip.left > guide.right || tip.right < guide.left).toBe(true);
    await userEvent.unhover(plot);
    await expect.element(layer).not.toHaveAttribute('data-visible');
  });

  it('draws every dot with dots="all" and none with dots="none"', async () => {
    const screen = await renderWithDS(
      <div>
        <Devices dots="all" />
        <Devices dots="none" defaultActiveIndex={1} />
      </div>,
      still,
    );
    const [all, none] = screen.container.querySelectorAll<HTMLElement>('[data-slot="line-chart"]');
    expect(all.querySelectorAll('[data-slot="dot"]')).toHaveLength(9);
    expect(none.querySelectorAll('[data-slot="active-dot"]')).toHaveLength(0);
    await expect
      .element(none.querySelector<HTMLElement>('[data-slot="crosshair"]')!)
      .toHaveAttribute('data-visible');
  });

  it('runs from the right in RTL, mirrors the keys, and can be pinned left to right', async () => {
    const screen = await renderWithDS(
      <div>
        <Devices />
        <Devices aria-label="Pinned" categoryDirection="ltr" />
      </div>,
      { ...still, locale: 'ar' },
    );
    const [mirrored, pinned] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="line-chart"]',
    );
    expect(mirrored.querySelector('g')!.getAttribute('transform')).toBe('matrix(-1 0 0 1 1000 0)');
    expect(pinned.querySelector('g')!.getAttribute('transform')).toBeNull();
    expect(pinned.querySelector('[data-slot="chart-body"]')!.getAttribute('dir')).toBe('ltr');

    const plot = screen.getByRole('group', { name: 'Weekly devices' }).element() as HTMLElement;
    plot.focus();
    await userEvent.keyboard('{ArrowLeft}');
    const guide = mirrored.querySelector<HTMLElement>('[data-slot="crosshair"]')!;
    const rect = guide.getBoundingClientRect();
    expect(rect.left + rect.width / 2).toBeCloseTo(plot.getBoundingClientRect().right, 0);
  });

  it('reveals the line on first view and skips it under reduced motion', async () => {
    const animated = await renderWithDS(<Devices />, { provider: { motion: 'system' } });
    const svg = animated.container.querySelector<SVGElement>('[data-slot="chart-svg"]')!;
    expect(svg.style.transition).toContain('clip-path 700ms');
    await expect
      .element(animated.container.querySelector<HTMLElement>('[data-slot="line-chart"]')!)
      .not.toHaveAttribute('data-pending');

    const reduced = await renderWithDS(<Devices />, still);
    const quiet = reduced.container.querySelector<SVGElement>('[data-slot="chart-svg"]')!;
    expect(quiet.style.clipPath).toBe('');
    expect(line(reduced.container, 'this-year').style.transition).toBe('');
  });

  it('takes its copy from labels', async () => {
    const screen = await renderWithDS(
      <Devices
        labels={{ pointAnnouncement: '{category} → {values}', seriesValue: '{value} ({series})' }}
      />,
      still,
    );
    screen.getByRole('group', { name: 'Weekly devices' }).element().focus();
    await userEvent.keyboard('{Home}');
    expect(screen.container.querySelector('[data-slot="chart-live"]')!.textContent).toBe(
      'W1 → 420 (This year), 310 (Last year)',
    );
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6">
          <Devices dots="all" />
          <Devices palette="mono" legend="top" />
          <Devices size="sm" />
          <Devices view="table" />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
