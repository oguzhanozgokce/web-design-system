import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard, type ChartCardProps } from '@/registry/ds/ui/chart-card';
import { LineChart } from '@/registry/ds/ui/line-chart';

const week = [
  { label: 'Mon', downloads: 1240 },
  { label: 'Tue', downloads: 1612 },
  { label: 'Wed', downloads: 1498 },
];

const month = [
  { label: 'Jan', downloads: 31200 },
  { label: 'Feb', downloads: 28640 },
];

const still = { provider: { motion: 'reduced' as const } };

function Downloads({ data = week, ...props }: Partial<ChartCardProps> & { data?: typeof week }) {
  return (
    <ChartCard
      className="w-[480px]"
      title="Downloads"
      description="Across every platform"
      value={data.reduce((sum, row) => sum + row.downloads, 0)}
      delta={{ value: 0.124 }}
      {...props}
    >
      <BarChart
        data={data}
        category="label"
        series={[{ id: 'downloads', label: 'Downloads', value: 'downloads' }]}
        showTrack
        radius="full"
      />
    </ChartCard>
  );
}

function Periods(props: Partial<ChartCardProps>) {
  const [period, setPeriod] = useState<Key>('week');
  return (
    <Downloads
      data={period === 'week' ? week : month}
      periods={[
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      {...props}
    />
  );
}

function valueText(container: HTMLElement) {
  return container.querySelector('[data-slot="chart-card-value"] .sr-only')!.textContent;
}

function captionText(container: HTMLElement) {
  return container.querySelector('[data-slot="chart-card-caption"]')?.textContent ?? null;
}

describe('ChartCard', () => {
  it('names the chart after its title and describes it with the description', async () => {
    const screen = await renderWithDS(<Downloads />, still);
    await expect
      .element(screen.getByRole('heading', { name: 'Downloads', level: 3 }))
      .toBeInTheDocument();
    const plot = screen.getByRole('group', { name: 'Downloads' });
    await expect.element(plot).toHaveAccessibleDescription(/^Downloads, Mon to Wed\./);
    const description = screen.getByText('Across every platform').element();
    expect(plot.element().getAttribute('aria-describedby')).toContain(description.id);
    expect(valueText(screen.container)).toBe('4,350');
    expect(captionText(screen.container)).toBeNull();
  });

  it('shows a delta tag whose colour follows the polarity and whose text says the direction', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <Downloads />
        <Downloads delta={{ value: -0.031, polarity: 'decrease-is-good' }} />
        <Downloads delta={{ value: -0.2 }} />
        <Downloads delta={{ value: 0 }} />
      </div>,
      still,
    );
    const tags = [
      ...screen.container.querySelectorAll<HTMLElement>('[data-slot="chart-card-delta"]'),
    ];
    expect(tags.map((tag) => tag.querySelector('.sr-only')!.textContent)).toEqual([
      'Up 12.4%',
      'Down 3.1%',
      'Down 20%',
      'No change',
    ]);
    expect(tags.map((tag) => tag.getAttribute('data-direction'))).toEqual([
      'up',
      'down',
      'down',
      'none',
    ]);
    const color = (tag: HTMLElement) =>
      getComputedStyle(tag.firstElementChild as HTMLElement).backgroundColor;
    expect(color(tags[0])).toBe(color(tags[1]));
    expect(color(tags[2])).not.toBe(color(tags[0]));
    expect(color(tags[3])).not.toBe(color(tags[0]));
    expect(tags[0].textContent).toBe('12.4%Up 12.4%');
    expect(tags[0].querySelector('svg')).not.toBeNull();
    expect(tags[3].querySelector('svg')).toBeNull();
  });

  it('switches the period with a segmented control and rolls the headline to the new total', async () => {
    const screen = await renderWithDS(<Periods />, still);
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toBeVisible();
    await expect.element(screen.getByRole('radio', { name: 'Week' })).toBeChecked();
    await screen.getByRole('radio', { name: 'Month' }).click();
    await expect.element(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
    await expect.poll(() => valueText(screen.container)).toBe('59,840');
    expect(screen.container.querySelectorAll('[data-slot="bar-group"]')).toHaveLength(2);
  });

  it('keeps its own period state when uncontrolled', async () => {
    const onPeriodChange = vi.fn();
    const screen = await renderWithDS(
      <Downloads
        periods={[
          { id: 'day', label: 'Day' },
          { id: 'week', label: 'Week' },
        ]}
        onPeriodChange={onPeriodChange}
      />,
      still,
    );
    await expect.element(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
    await screen.getByRole('radio', { name: 'Week' }).click();
    expect(onPeriodChange).toHaveBeenLastCalledWith('week');
    await expect.element(screen.getByRole('radio', { name: 'Week' })).toBeChecked();
  });

  it('swaps the headline for the active bar in readout mode instead of a tooltip', async () => {
    const screen = await renderWithDS(<Downloads readout="headline" />, still);
    expect(captionText(screen.container)).toBe('Total');
    const plot = screen.getByRole('group', { name: 'Downloads' }).element() as HTMLElement;
    plot.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect.poll(() => captionText(screen.container)).toBe('Tue');
    expect(valueText(screen.container)).toBe('1,612');
    expect(screen.container.querySelector('[data-slot="tooltip-layer"]')).toBeNull();
    const delta = screen.container.querySelector('[data-slot="chart-card-delta"]')!;
    expect(delta.getAttribute('aria-hidden')).toBe('true');

    const rect = plot.getBoundingClientRect();
    await page
      .elementLocator(plot)
      .hover({ position: { x: rect.width * 0.9, y: rect.height / 2 } });
    await expect.poll(() => captionText(screen.container)).toBe('Wed');
    expect(valueText(screen.container)).toBe('1,498');

    await userEvent.unhover(plot);
    await expect.poll(() => captionText(screen.container)).toBe('Total');
    expect(valueText(screen.container)).toBe('4,350');
    expect(delta.hasAttribute('aria-hidden')).toBe(false);
  });

  it('reads out a line chart and lets readoutValue pick the figure', async () => {
    const screen = await renderWithDS(
      <ChartCard
        title="Active users"
        caption="This year"
        value={100}
        readout="headline"
        readoutValue={(point) => point.values[1].value ?? 0}
      >
        <LineChart
          data={[
            { month: 'Jan', now: 40, then: 30 },
            { month: 'Feb', now: 60, then: 35 },
          ]}
          category="month"
          series={[
            { id: 'now', label: 'This year', value: 'now' },
            { id: 'then', label: 'Last year', value: 'then', lineStyle: 'dashed' },
          ]}
        />
      </ChartCard>,
      still,
    );
    expect(captionText(screen.container)).toBe('This year');
    screen.getByRole('group', { name: 'Active users' }).element().focus();
    await userEvent.keyboard('{End}');
    await expect.poll(() => captionText(screen.container)).toBe('Feb');
    expect(valueText(screen.container)).toBe('35');
  });

  it('toggles a table view', async () => {
    const onViewChange = vi.fn();
    const screen = await renderWithDS(
      <Downloads showTableToggle onViewChange={onViewChange} />,
      still,
    );
    const toggle = screen.getByRole('button', { name: 'Show as table' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    expect(onViewChange).toHaveBeenLastCalledWith('table');
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    const table = screen.getByRole('table', { name: 'Downloads' });
    await expect.element(table).toBeVisible();
    expect(screen.container.querySelector('[data-slot="plot"]')).toBeNull();
    await toggle.click();
    await expect.element(screen.getByRole('group', { name: 'Downloads' })).toBeVisible();
  });

  it('delegates loading, empty and error to ContentState', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <Downloads status="loading" />
        <Downloads status="empty" />
        <Downloads status="error" onRetry={onRetry} />
      </div>,
      still,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading chart' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('heading', { name: 'No data for this period', level: 4 }))
      .toBeInTheDocument();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.container.querySelectorAll('[data-slot="chart-card-headline"]')).toHaveLength(0);
  });

  it('takes its copy from labels and DSProvider', async () => {
    const screen = await renderWithDS(
      <Periods showTableToggle readout="headline" labels={{ increase: '{value} arttı' }} />,
      {
        ...still,
        provider: {
          ...still.provider,
          labels: {
            chartCard: { period: 'Dönem', showTable: 'Tablo olarak göster', total: 'Toplam' },
          },
        },
      },
    );
    await expect.element(screen.getByRole('radiogroup', { name: 'Dönem' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Tablo olarak göster' }))
      .toBeInTheDocument();
    expect(captionText(screen.container)).toBe('Toplam');
    expect(
      screen.container.querySelector('[data-slot="chart-card-delta"] .sr-only')!.textContent,
    ).toBe('12.4% arttı');
  });

  it('stacks the header at 375px', async () => {
    await page.viewport(375, 700);
    try {
      const screen = await renderWithDS(<Periods className="w-full" />, still);
      const heading = screen.getByRole('heading', { name: 'Downloads' }).element();
      const control = screen.getByRole('radiogroup', { name: 'Period' }).element();
      expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(375);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
      expect(heading.getBoundingClientRect().width).toBeGreaterThan(0);
    } finally {
      await page.viewport(1280, 720);
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <Periods showTableToggle />
          <Downloads readout="headline" variant="soft" />
          <Downloads status="loading" />
          <Downloads view="table" />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
