import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';

import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { LineChart } from '@/registry/ds/ui/line-chart';
import { ChartLegend, ChartTooltip, seriesColors, type ChartSeries } from '@/registry/ds/ui/chart';

const still = { provider: { motion: 'reduced' as const } };

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
          aria-label="Uploaded files"
          data={rows}
          category="month"
          series={series}
          labels={{ dataTable: '{title} data', category: 'Month' }}
        />
      </div>,
      { ...still, provider: { ...still.provider, labels: { chart: { chart: 'Data chart' } } } },
    );
    await expect.element(screen.getByRole('group', { name: 'Data chart' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('table', { name: 'Data for Data chart' }))
      .toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Uploaded files data' });
    await expect.element(table).toBeInTheDocument();
    await expect.element(table.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
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
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
