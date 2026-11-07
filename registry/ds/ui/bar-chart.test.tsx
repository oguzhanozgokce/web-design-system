import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { BarChart, type BarChartProps } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Day {
  day: string;
  direct: number;
  search: number;
  bounced: number;
}

const data: Day[] = [
  { day: 'Mon', direct: 40, search: 30, bounced: 4 },
  { day: 'Tue', direct: 50, search: 20, bounced: 2 },
  { day: 'Wed', direct: 30, search: 25, bounced: 6 },
];

const series: ChartSeries<Day>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'bounced', label: 'Bounced', value: 'bounced', isBelowBaseline: true },
];

const still = { provider: { motion: 'reduced' as const } };

function Visits(props: Partial<BarChartProps<Day>>) {
  return (
    <div className="w-[480px] bg-surface-raised p-4">
      <BarChart
        aria-label="Visits"
        data={data}
        category="day"
        series={series}
        layout="stacked"
        {...props}
      />
    </div>
  );
}

function groups(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[data-slot="bar-group"]')];
}

function segment(group: HTMLElement, id: string) {
  return group.querySelector<HTMLElement>(`[data-series="${id}"]`)!;
}

function liveText(container: HTMLElement) {
  return container.querySelector('[data-slot="chart-live"]')!.textContent;
}

async function hoverAt(plot: HTMLElement, fraction: number) {
  const rect = plot.getBoundingClientRect();
  await page.elementLocator(plot).hover({
    position: { x: rect.width * fraction, y: rect.height / 2 },
  });
}

describe('BarChart', () => {
  it('renders a named chart with a description and a hidden data table', async () => {
    const screen = await renderWithDS(<Visits description="Bounced visits hang below." />, still);
    const plot = screen.getByRole('group', { name: 'Visits' });
    await expect.element(plot).toHaveAttribute('aria-roledescription', 'chart');
    await expect.element(plot).toHaveAttribute('tabindex', '0');
    await expect
      .element(plot)
      .toHaveAccessibleDescription(
        'Bounced visits hang below. Direct, Search, and Bounced, Mon to Wed. Use the arrow keys to move between points.',
      );
    const table = screen.getByRole('table', { name: 'Data for Visits' });
    await expect.element(table).toBeInTheDocument();
    expect(table.element().closest('.sr-only, [class*="sr-only"]') ?? table.element()).toBeTruthy();
    const headers = [...table.element().querySelectorAll('th[scope="col"]')].map(
      (cell) => cell.textContent,
    );
    expect(headers).toEqual(['Category', 'Direct', 'Search', 'Bounced', 'Total']);
    const first = [...table.element().querySelectorAll('tbody tr')[0].children].map(
      (cell) => cell.textContent,
    );
    expect(first).toEqual(['Mon', '40', '30', '4', '70']);
    for (const mark of screen.container.querySelectorAll('[data-slot="bar-group"]')) {
      expect(mark.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('stacks every segment as its own capsule and hangs the below-baseline series under it', async () => {
    const screen = await renderWithDS(<Visits />, still);
    const [mon] = groups(screen.container);
    const direct = segment(mon, 'direct').getBoundingClientRect();
    const search = segment(mon, 'search').getBoundingClientRect();
    const bounced = segment(mon, 'bounced').getBoundingClientRect();
    const baseline = screen.container
      .querySelector('[data-slot="baseline"]')!
      .getBoundingClientRect();
    expect(direct.top - search.bottom).toBeCloseTo(2, 0);
    expect(direct.bottom - baseline.top).toBeCloseTo(-1.5, 0);
    expect(bounced.top - baseline.bottom).toBeCloseTo(1.5, 0);
    expect(direct.height / search.height).toBeCloseTo(40 / 30, 1);
    expect(getComputedStyle(segment(mon, 'direct')).borderRadius).not.toBe('0px');
    const tue = groups(screen.container)[1];
    expect(segment(tue, 'bounced').getBoundingClientRect().height).toBeLessThan(bounced.height);
  });

  it('places grouped bars side by side and percent stacks at full height', async () => {
    const grouped = await renderWithDS(
      <Visits layout="grouped" series={series.slice(0, 2)} />,
      still,
    );
    const [mon] = groups(grouped.container);
    const bars = mon.querySelectorAll('[data-slot="bar"]');
    expect(bars).toHaveLength(2);
    const a = segment(mon, 'direct').getBoundingClientRect();
    const b = segment(mon, 'search').getBoundingClientRect();
    expect(b.left).toBeGreaterThan(a.right);
    expect(a.bottom).toBeCloseTo(b.bottom, 0);

    const percent = await renderWithDS(
      <Visits layout="percent" series={series.slice(0, 2)} />,
      still,
    );
    const heights = groups(percent.container).map((group) => {
      const top = segment(group, 'search').getBoundingClientRect().top;
      const bottom = segment(group, 'direct').getBoundingClientRect().bottom;
      return bottom - top;
    });
    expect(heights[0]).toBeCloseTo(heights[1], 0);
    expect(heights[1]).toBeCloseTo(heights[2], 0);
    const ticks = [...percent.container.querySelectorAll('[data-slot="value-tick"]')];
    expect(ticks.map((tick) => tick.textContent)).toEqual([
      '0%',
      '20%',
      '40%',
      '60%',
      '80%',
      '100%',
    ]);
  });

  it('moves the active column with the arrow keys, Home and End, and announces it', async () => {
    const screen = await renderWithDS(<Visits />, still);
    const plot = screen.getByRole('group', { name: 'Visits' });
    plot.element().focus();
    await userEvent.keyboard('{ArrowRight}');
    const all = groups(screen.container);
    await expect.element(all[0]).toHaveAttribute('data-active');
    expect(liveText(screen.container)).toBe('Mon: Total 70, Direct 40, Search 30, Bounced 4');
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(all[1]).toHaveAttribute('data-active');
    await userEvent.keyboard('{End}');
    await expect.element(all[2]).toHaveAttribute('data-active');
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(all[2]).toHaveAttribute('data-active');
    await userEvent.keyboard('{Home}');
    await expect.element(all[0]).toHaveAttribute('data-active');
    expect(liveText(screen.container)).toContain('Mon');
    await userEvent.keyboard('{Escape}');
    await expect.element(all[0]).not.toHaveAttribute('data-active');
    expect(liveText(screen.container)).toBe('');
  });

  it('runs from the inline start in RTL, mirrors the arrow keys, and can keep time left to right', async () => {
    const screen = await renderWithDS(
      <div>
        <Visits />
        <Visits aria-label="Pinned" categoryDirection="ltr" />
      </div>,
      { ...still, locale: 'ar' },
    );
    const [mirrored, pinned] =
      screen.container.querySelectorAll<HTMLElement>('[data-slot="bar-chart"]');
    const all = groups(mirrored);
    expect(all[0].getBoundingClientRect().left).toBeGreaterThan(
      all[2].getBoundingClientRect().left,
    );
    screen.getByRole('group', { name: 'Visits' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(all[0]).toHaveAttribute('data-active');
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(all[1]).toHaveAttribute('data-active');
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(all[0]).toHaveAttribute('data-active');

    const ordered = groups(pinned);
    expect(ordered[0].getBoundingClientRect().left).toBeLessThan(
      ordered[2].getBoundingClientRect().left,
    );
    screen.getByRole('group', { name: 'Pinned' }).element().focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect.element(ordered[1]).toHaveAttribute('data-active');
  });

  it('rings the hovered column, dims the others and shows one tooltip beside it', async () => {
    const screen = await renderWithDS(<Visits />, still);
    const plot = screen.getByRole('group', { name: 'Visits' }).element() as HTMLElement;
    const all = groups(screen.container);
    const restColor = getComputedStyle(segment(all[0], 'direct')).backgroundColor;

    await hoverAt(plot, 0.5);
    await expect.element(all[1]).toHaveAttribute('data-active');
    const ring = screen.container.querySelector<HTMLElement>('[data-slot="bar-ring"]')!;
    await expect.element(ring).toHaveAttribute('data-visible');
    const ringRect = ring.getBoundingClientRect();
    const column = all[1].getBoundingClientRect();
    expect(column.left - ringRect.left).toBeCloseTo(3, 0);
    expect(parseFloat(getComputedStyle(ring).borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(getComputedStyle(segment(all[1], 'direct')).backgroundColor).toBe(restColor);
    expect(getComputedStyle(segment(all[0], 'direct')).backgroundColor).not.toBe(restColor);

    const layer = screen.container.querySelector<HTMLElement>('[data-slot="tooltip-layer"]')!;
    await expect.element(layer).toHaveAttribute('data-visible');
    await expect.element(layer).toHaveAttribute('aria-hidden', 'true');
    expect(layer.textContent).toBe('Tue70Direct50Search20Bounced2');
    const tip = layer.getBoundingClientRect();
    expect(tip.left).toBeGreaterThanOrEqual(column.right);

    await hoverAt(plot, 0.9);
    await expect.element(all[2]).toHaveAttribute('data-active');
    expect(layer.textContent).toContain('Wed');
    const last = all[2].getBoundingClientRect();
    await expect
      .poll(() => layer.getBoundingClientRect().right)
      .toBeLessThanOrEqual(last.left + 0.5);

    await userEvent.unhover(plot);
    await expect.element(layer).not.toHaveAttribute('data-visible');
    await expect.element(all[2]).not.toHaveAttribute('data-active');
  });

  it('calls onAction for a pressed column or Enter on the active one', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(<Visits onAction={onAction} />, still);
    const plot = screen.getByRole('group', { name: 'Visits' }).element() as HTMLElement;
    const rect = plot.getBoundingClientRect();
    await page
      .elementLocator(plot)
      .click({ position: { x: rect.width * 0.1, y: rect.height / 2 } });
    expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ index: 0, label: 'Mon' }));
    plot.focus();
    await userEvent.keyboard('{End}{Enter}');
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 2, label: 'Wed', total: 55 }),
    );
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('follows a controlled active index', async () => {
    const onActiveIndexChange = vi.fn();
    const screen = await renderWithDS(
      <Visits activeIndex={1} onActiveIndexChange={onActiveIndexChange} />,
      still,
    );
    const all = groups(screen.container);
    await expect.element(all[1]).toHaveAttribute('data-active');
    screen.getByRole('group', { name: 'Visits' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    await expect.element(all[1]).toHaveAttribute('data-active');
  });

  it('stands each bar in a full-height track with showTrack', async () => {
    const screen = await renderWithDS(
      <Visits layout="grouped" series={series.slice(0, 1)} showTrack radius="full" />,
      still,
    );
    const plot = screen.getByRole('group', { name: 'Visits' }).element() as HTMLElement;
    const tracks = screen.container.querySelectorAll<HTMLElement>('[data-slot="bar-track"]');
    expect(tracks).toHaveLength(3);
    const track = tracks[0].getBoundingClientRect();
    expect(track.height).toBeCloseTo(plot.getBoundingClientRect().height - 2, 0);
    expect(screen.container.querySelectorAll('[data-slot="grid-line"]')).toHaveLength(0);
    expect(screen.container.querySelector('[data-slot="baseline"]')).toBeNull();
    const bar = segment(groups(screen.container)[0], 'direct');
    expect(parseFloat(getComputedStyle(bar).borderRadius)).toBeGreaterThan(100);
  });

  it('lays horizontal bars along the inline axis and moves with up and down', async () => {
    const screen = await renderWithDS(
      <Visits orientation="horizontal" layout="grouped" series={series.slice(0, 1)} />,
      still,
    );
    const all = groups(screen.container);
    const mon = segment(all[0], 'direct').getBoundingClientRect();
    const wed = segment(all[2], 'direct').getBoundingClientRect();
    expect(mon.width / wed.width).toBeCloseTo(40 / 30, 1);
    expect(wed.top).toBeGreaterThan(mon.bottom);
    expect(mon.left).toBeCloseTo(wed.left, 0);
    screen.getByRole('group', { name: 'Visits' }).element().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect.element(all[1]).toHaveAttribute('data-active');
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(all[0]).toHaveAttribute('data-active');
  });

  it('grows column after column with motion and draws the final chart at once without it', async () => {
    const animated = await renderWithDS(<Visits />, { provider: { motion: 'system' } });
    const root = animated.container.querySelector<HTMLElement>('[data-slot="bar-chart"]')!;
    await expect.element(root).not.toHaveAttribute('data-pending');
    const columns = groups(animated.container);
    const first = segment(columns[0], 'direct').style.transition;
    expect(first).toContain('height');
    expect(segment(columns[1], 'direct').style.transition).not.toBe(first);

    const reduced = await renderWithDS(<Visits />, still);
    const settled = reduced.container.querySelector<HTMLElement>('[data-slot="bar-chart"]')!;
    expect(settled.hasAttribute('data-pending')).toBe(false);
    expect(segment(groups(reduced.container)[0], 'direct').style.transition).not.toContain(
      'height',
    );
    const disabled = await renderWithDS(<Visits />, { provider: { motion: 'disabled' } });
    expect(segment(groups(disabled.container)[0], 'direct').style.transition).toBe('none');
  });

  it('shows its data as a table with view="table"', async () => {
    const screen = await renderWithDS(<Visits view="table" />, still);
    const region = screen.getByRole('region', { name: 'Data for Visits' });
    await expect.element(region).toBeVisible();
    await expect.element(region).toHaveAttribute('tabindex', '0');
    await expect.element(screen.getByRole('table', { name: 'Data for Visits' })).toBeVisible();
    expect(screen.container.querySelector('[data-slot="plot"]')).toBeNull();
  });

  it('is a quiet image at size sm', async () => {
    const screen = await renderWithDS(<Visits size="sm" />, still);
    const image = screen.getByRole('img', { name: 'Visits' });
    await expect.element(image).not.toHaveAttribute('tabindex');
    expect(screen.container.querySelector('[data-slot="value-axis"]')).toBeNull();
    expect(screen.container.querySelector('[data-slot="chart-legend"]')).toBeNull();
  });

  it('takes its copy from labels and DSProvider', async () => {
    const screen = await renderWithDS(
      <Visits
        labels={{ keyboardHint: 'Ok tuşlarıyla gezin.', seriesValue: '{value} ({series})' }}
      />,
      {
        ...still,
        provider: {
          ...still.provider,
          labels: {
            chart: {
              total: 'Toplam',
              summary: '{series}: {first} – {last}.',
              legend: 'Açıklama',
              roleDescription: 'grafik',
              pointAnnouncement: '{category} → {values}',
            },
          },
        },
      },
    );
    const plot = screen.getByRole('group', { name: 'Visits' });
    await expect.element(plot).toHaveAttribute('aria-roledescription', 'grafik');
    await expect
      .element(plot)
      .toHaveAccessibleDescription('Direct, Search, and Bounced: Mon – Wed. Ok tuşlarıyla gezin.');
    await expect.element(screen.getByRole('list', { name: 'Açıklama' })).toBeInTheDocument();
    await expect.element(screen.getByRole('columnheader', { name: 'Toplam' })).toBeInTheDocument();
    plot.element().focus();
    await userEvent.keyboard('{Home}');
    expect(liveText(screen.container)).toBe(
      'Mon → 70 (Toplam), 40 (Direct), 30 (Search), 4 (Bounced)',
    );
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-6">
          <Visits />
          <Visits layout="grouped" series={series.slice(0, 2)} palette="mono" />
          <Visits orientation="horizontal" showTrack />
          <Visits size="sm" />
          <Visits view="table" />
        </div>,
        { ...options, ...still },
      );
      await expectNoA11yViolations(screen.container);
    }
  });
});
