import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  areaPath,
  axisFormatOptions,
  bandScale,
  categoryTickPriority,
  extent,
  linePath,
  linearScale,
  niceTicks,
  normalizeRows,
  pointScale,
  stack,
} from '@/registry/ds/lib/chart';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { LineChart } from '@/registry/ds/ui/line-chart';
import {
  ChartLegend,
  ChartTooltip,
  defaultChartLabels,
  seriesColors,
  type ChartSeries,
} from '@/registry/ds/ui/chart';

const still = { provider: { motion: 'reduced' as const } };

function controlPoints(path: string) {
  return [...path.matchAll(/C([^C]+)/g)].map((match) =>
    match[1].split(/[ ,]/).filter(Boolean).map(Number),
  );
}

describe('lib/chart', () => {
  it('rounds value domains to nice ticks', () => {
    expect(niceTicks(0, 48.2, 4)).toEqual({
      domain: [0, 50],
      ticks: [0, 10, 20, 30, 40, 50],
      step: 10,
    });
    expect(niceTicks(-11, 22, 4).ticks).toEqual([-20, -10, 0, 10, 20, 30]);
    expect(niceTicks(0, 0).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(5, 5).domain).toEqual([0, 5]);
    expect(niceTicks(-3, -3).domain[1]).toBe(0);
  });

  it('maps values with linear, band and point scales', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(5)).toBe(50);
    expect(scale.invert(25)).toBe(2.5);
    const band = bandScale(4, { padding: 0.2 });
    expect(band.step).toBe(0.25);
    expect(band.bandwidth).toBeCloseTo(0.2);
    expect(band.start(1)).toBeCloseTo(0.275);
    expect(band.center(1)).toBeCloseTo(0.375);
    expect(band.indexAt(0.99)).toBe(3);
    const point = pointScale(5);
    expect(point.position(4)).toBe(1);
    expect(point.indexAt(0.6)).toBe(2);
    expect(pointScale(1).position(0)).toBe(0.5);
  });

  it('stacks positive values up and negative values down from zero', () => {
    const layout = stack([
      [3, -2, null],
      [4, -1, 5],
    ]);
    expect(layout.segments[0]).toEqual([{ start: 0, end: 3 }, { start: 0, end: -2 }, null]);
    expect(layout.segments[1]).toEqual([
      { start: 3, end: 7 },
      { start: -2, end: -3 },
      { start: 0, end: 5 },
    ]);
    expect(layout.positiveTotals).toEqual([7, 0, 5]);
    expect(layout.negativeTotals).toEqual([0, -3, 0]);
    expect([layout.min, layout.max]).toEqual([-3, 7]);
    expect(
      normalizeRows([
        [1, 3],
        [3, null],
      ]),
    ).toEqual([
      [0.25, 1],
      [0.75, null],
    ]);
    expect(extent([4, null, -2, 9])).toEqual([-2, 9]);
  });

  it('draws linear, step and monotone paths that break at missing values', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, null, { x: 3, y: 3 }, { x: 4, y: 4 }];
    expect(linePath(points, 'linear')).toBe('M0,0L1,1M3,3L4,4');
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        'step',
      ),
    ).toBe('M0,0H5V10H10');
    expect(
      areaPath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        [
          { x: 0, y: 100 },
          { x: 10, y: 100 },
        ],
        'linear',
      ),
    ).toBe('M0,0L10,10L10,100L0,100Z');

    const rising = [0, 10, 11, 30].map((y, x) => ({ x: x * 10, y }));
    const path = linePath(rising, 'monotone');
    const segments = controlPoints(path);
    expect(segments).toHaveLength(3);
    segments.forEach(([, y1, , y2], index) => {
      const low = rising[index].y;
      const high = rising[index + 1].y;
      for (const y of [y1, y2]) {
        expect(y).toBeGreaterThanOrEqual(low - 1e-9);
        expect(y).toBeLessThanOrEqual(high + 1e-9);
      }
    });
  });

  it('picks compact or fractional axis formats from the ticks', () => {
    expect(axisFormatOptions([0, 10_000, 20_000]).notation).toBe('compact');
    expect(axisFormatOptions([0, 0.5, 1]).minimumFractionDigits).toBe(1);
    expect(axisFormatOptions([0, 10, 20]).maximumFractionDigits).toBe(0);
    expect(axisFormatOptions([0, 0.5, 1], { style: 'percent' }).style).toBe('percent');
  });

  it('thins category labels by priority', () => {
    expect(categoryTickPriority(5, 'ends')).toEqual([0, null, null, null, 0]);
    expect(categoryTickPriority(3, 'all')).toEqual([0, 0, 0]);
    const auto = categoryTickPriority(30, 'auto');
    expect(auto.filter((priority) => priority !== null)).toHaveLength(10);
    expect(auto.slice(0, 7)).toEqual([0, null, null, 1, null, null, 0]);
  });
});

describe('seriesColors', () => {
  it('uses primary for one series and the categorical roles in order for several', () => {
    expect(seriesColors([{}])).toEqual(['primary']);
    expect(seriesColors([{}, {}, {}])).toEqual(['chart-1', 'chart-2', 'chart-3']);
    expect(seriesColors([{}, { color: 'neutral' }, {}])).toEqual(['chart-1', 'neutral', 'chart-3']);
  });

  it('keeps below-baseline series out of the categorical order', () => {
    expect(seriesColors([{}, {}, { isBelowBaseline: true }])).toEqual([
      'chart-1',
      'chart-2',
      'error',
    ]);
    expect(seriesColors([{}, { isBelowBaseline: true }])).toEqual(['primary', 'error']);
    expect(seriesColors([{}, {}, { isBelowBaseline: true }], 'mono')).toEqual([
      'mono-1',
      'mono-2',
      'mono-1',
    ]);
  });

  it('never cycles: a ninth series falls back to neutral with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const colors = seriesColors(Array.from({ length: 9 }, () => ({})));
    expect(colors.slice(0, 8)).toEqual([
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
      'chart-5',
      'chart-6',
      'chart-7',
      'chart-8',
    ]);
    expect(colors[8]).toBe('neutral');
    warn.mockRestore();
  });
});

interface Row {
  month: string;
  photos: number;
  videos: number;
}

const rows: Row[] = [
  { month: 'Jan', photos: 412, videos: 96 },
  { month: 'Feb', photos: 388, videos: 104 },
];

const series: ChartSeries<Row>[] = [
  { id: 'photos', label: 'Photos', value: 'photos' },
  { id: 'videos', label: 'Videos', value: 'videos' },
];

describe('chart parts', () => {
  it('renders a named legend with a marker per series', async () => {
    const screen = await renderWithDS(
      <ChartLegend
        items={[
          { id: 'photos', label: 'Photos', color: 'chart-1' },
          { id: 'last-year', label: 'Last year', color: 'neutral', marker: 'dashed' },
          { id: 'bounced', label: 'Bounced', color: 'error', texture: 'hatched' },
        ]}
      />,
    );
    const legend = screen.getByRole('list', { name: 'Legend' });
    await expect.element(legend).toBeVisible();
    expect(legend.element().querySelectorAll('li')).toHaveLength(3);
    const markers = legend.element().querySelectorAll<HTMLElement>('[data-slot="marker"]');
    expect(markers[0].getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(markers[1]).backgroundImage).toContain('repeating-linear-gradient');
    expect(getComputedStyle(markers[2]).backgroundImage).toContain('repeating-linear-gradient');
  });

  it('renders a tooltip card with a title, a total and a row per series', async () => {
    const screen = await renderWithDS(
      <ChartTooltip
        title="Thursday"
        total="1,212"
        items={[
          { id: 'direct', label: 'Direct', value: '574', color: 'chart-1' },
          { id: 'search', label: 'Search', value: '402', color: 'chart-2' },
        ]}
      />,
    );
    const tooltip = screen.container.querySelector<HTMLElement>('[data-slot="chart-tooltip"]')!;
    expect(tooltip.textContent).toBe('Thursday1,212Direct574Search402');
    expect(tooltip.querySelectorAll('[data-slot="tooltip-row"]')).toHaveLength(2);
    expect(tooltip.getBoundingClientRect().width).toBeLessThan(300);
  });

  it('paints each series with its role colour', async () => {
    const screen = await renderWithDS(
      <BarChart aria-label="Uploads" data={rows} category="month" series={series} />,
      still,
    );
    const segment = (id: string) =>
      screen.container.querySelector<HTMLElement>(`[data-series="${id}"]`)!;
    const style = getComputedStyle(segment('photos'));
    expect(style.getPropertyValue('--chart-color').trim()).toBe(
      style.getPropertyValue('--chart-1').trim(),
    );
    expect(getComputedStyle(segment('videos')).getPropertyValue('--chart-color').trim()).toBe(
      style.getPropertyValue('--chart-2').trim(),
    );
    expect(style.backgroundColor).not.toBe(getComputedStyle(segment('videos')).backgroundColor);
  });

  it('names an unnamed chart and captions its data table from the labels', async () => {
    const screen = await renderWithDS(
      <div>
        <BarChart data={rows} category="month" series={series} />
        <BarChart
          aria-label="Yüklemeler"
          data={rows}
          category="month"
          series={series}
          labels={{ dataTable: '{title} verileri', category: 'Ay' }}
        />
      </div>,
      { ...still, provider: { ...still.provider, labels: { chart: { chart: 'Grafik' } } } },
    );
    await expect.element(screen.getByRole('group', { name: 'Grafik' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('table', { name: 'Data for Grafik' }))
      .toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Yüklemeler verileri' });
    await expect.element(table).toBeInTheDocument();
    await expect.element(table.getByRole('columnheader', { name: 'Ay' })).toBeInTheDocument();
    expect(defaultChartLabels.dataTable).toBe('Data for {title}');
  });

  it('renders the finished chart on the server and hydrates without moving it', async () => {
    for (const motion of ['reduced', 'system'] as const) {
      const ui = (
        <DSProvider motion={motion}>
          <div className="light w-[480px] bg-surface-raised p-4">
            <ChartCard title="Uploads" value={1000}>
              <BarChart data={rows} category="month" series={series} layout="stacked" />
            </ChartCard>
            <LineChart aria-label="Trend" data={rows} category="month" series={series} />
          </div>
        </DSProvider>
      );
      const container = document.createElement('div');
      container.innerHTML = renderToString(ui);
      document.body.append(container);
      expect(container.querySelectorAll('[data-slot="bar-segment"]')).toHaveLength(4);
      expect(container.querySelector('[data-slot="line"]')!.getAttribute('d')).toMatch(/^M0,/);
      expect(container.querySelectorAll('table')).toHaveLength(2);
      const marks = () =>
        [...container.querySelectorAll('[data-slot="bar-group"], [data-slot="chart-svg"]')].map(
          (mark) => {
            const rect = mark.getBoundingClientRect();
            return [rect.left, rect.width, rect.height].map(Math.round);
          },
        );
      const before = marks();
      const onRecoverableError = vi.fn();
      const root = hydrateRoot(container, ui, { onRecoverableError });
      await expect
        .poll(() =>
          container.querySelector('[data-slot="bar-chart"]')!.hasAttribute('data-pending'),
        )
        .toBe(false);
      expect(marks()).toEqual(before);
      expect(onRecoverableError).not.toHaveBeenCalled();
      root.unmount();
      container.remove();
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 bg-surface-raised p-4">
          <ChartLegend
            items={[
              { id: 'photos', label: 'Photos', color: 'chart-1' },
              { id: 'videos', label: 'Videos', color: 'chart-2', marker: 'line' },
            ]}
          />
          <ChartTooltip
            title="Jan"
            items={[{ id: 'photos', label: 'Photos', value: '412', color: 'chart-1' }]}
          />
          <BarChart aria-label="Uploads" data={rows} category="month" series={series} />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
