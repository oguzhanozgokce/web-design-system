import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { AreaChart, type AreaChartProps } from '@/registry/ds/ui/area-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Month {
  month: string;
  photos: number;
  videos: number;
}

const data: Month[] = [
  { month: 'Jan', photos: 42, videos: 28 },
  { month: 'Feb', photos: 46, videos: 31 },
  { month: 'Mar', photos: 51, videos: 30 },
  { month: 'Apr', photos: 55, videos: 36 },
];

const series: ChartSeries<Month>[] = [
  { id: 'photos', label: 'Photos', value: 'photos' },
  { id: 'videos', label: 'Videos', value: 'videos' },
];

const still = { provider: { motion: 'reduced' as const } };

function Storage(props: Partial<AreaChartProps<Month>>) {
  return (
    <div className="w-[480px] bg-surface-raised p-4">
      <AreaChart aria-label="Storage" data={data} category="month" series={series} {...props} />
    </div>
  );
}

function areas(container: HTMLElement) {
  return [...container.querySelectorAll<SVGPathElement>('[data-slot="area"]')];
}

function topOf(path: SVGPathElement) {
  return path.getBoundingClientRect().top;
}

describe('AreaChart', () => {
  it('fills a single series with a gradient under its line, or solid when asked', async () => {
    const screen = await renderWithDS(
      <>
        <Storage series={series.slice(0, 1)} />
        <Storage series={series.slice(0, 1)} fill="solid" />
      </>,
      still,
    );
    const [gradientArea, solidArea] = areas(screen.container);
    const gradient = screen.container.querySelector('linearGradient')!;
    expect(gradientArea.getAttribute('fill')).toBe(`url(#${gradient.id})`);
    expect(gradientArea.getAttribute('d')).toMatch(/Z$/);
    const root = screen.container.querySelector('[data-slot="area-chart"]')!;
    expect(root.getAttribute('data-layout')).toBe('overlap');
    expect(screen.container.querySelector('[data-slot="chart-legend"]')).toBeNull();
    expect(solidArea.getAttribute('fill')).toBe('var(--chart-color)');
    expect(Number(solidArea.getAttribute('fill-opacity'))).toBeGreaterThan(0);
  });

  it('stacks series on top of each other and totals them', async () => {
    const screen = await renderWithDS(<Storage layout="stacked" />, still);
    const [photos, videos] = areas(screen.container);
    expect(photos.getAttribute('fill')).toBe('var(--chart-color)');
    expect(topOf(videos)).toBeLessThan(topOf(photos));
    const table = screen.getByRole('table', { name: 'Data for Storage' });
    await expect.element(table.getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();
  });

  it('normalises each category to a whole with layout="percent"', async () => {
    const screen = await renderWithDS(<Storage layout="percent" />, still);
    const ticks = [...screen.container.querySelectorAll('[data-slot="value-tick"]')].map(
      (tick) => tick.textContent,
    );
    expect(ticks[0]).toBe('0%');
    expect(ticks.at(-1)).toBe('100%');
    const plot = screen.getByRole('group', { name: 'Storage' }).element();
    const [, videos] = areas(screen.container);
    expect(topOf(videos)).toBeCloseTo(plot.getBoundingClientRect().top, 0);
  });

  it('draws a dashed comparison series as a line without a fill', async () => {
    const screen = await renderWithDS(
      <Storage
        series={[
          series[0],
          {
            id: 'last-year',
            label: 'Last year',
            value: 'videos',
            color: 'neutral',
            lineStyle: 'dashed',
          },
        ]}
      />,
      still,
    );
    expect(areas(screen.container)).toHaveLength(1);
    expect(screen.container.querySelectorAll('[data-slot="line"]')).toHaveLength(2);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6">
          <Storage />
          <Storage layout="stacked" legend="top" />
          <Storage layout="percent" palette="mono" />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
