import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { FunnelChart } from '@/registry/ds/ui/funnel-chart';

const stages = [
  { id: 'installed', label: 'Installed', value: 100 },
  { id: 'signed-in', label: 'Signed in', value: 70 },
  { id: 'active', label: 'First action', value: 35 },
];

describe('FunnelChart', () => {
  it('uses the card title for its data and follows the host table toggle', async () => {
    const screen = await renderWithDS(
      <ChartCard title="Activation" showTableToggle>
        <FunnelChart stages={stages} />
      </ChartCard>,
    );
    const table = screen.getByRole('table', { name: 'Activation' });
    await expect.element(table).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Show as table' }).click();
    await expect.element(table).toBeVisible();
    await expect
      .element(screen.getByRole('row', { name: 'First action 35 50% 35%' }))
      .toBeVisible();
    expect(screen.container.querySelector('svg[data-slot="funnel-flow"]')).toBeNull();
  });

  it('formats counts and rates with the provider locale and accepts local labels', async () => {
    const screen = await renderWithDS(
      <FunnelChart
        stages={[
          { id: 'first', label: 'Started', value: 1234 },
          { id: 'last', label: 'Finished', value: 617 },
        ]}
        view="table"
        labels={{ previous: 'Step conversion' }}
      />,
      { locale: 'de-DE', provider: { labels: { funnelChart: { count: 'People' } } } },
    );
    await expect.element(screen.getByRole('columnheader', { name: 'People' })).toBeVisible();
    await expect
      .element(screen.getByRole('columnheader', { name: 'Step conversion' }))
      .toBeVisible();
    await expect.element(screen.getByRole('cell', { name: '1.234', exact: true })).toBeVisible();
    await expect.element(screen.getByRole('row', { name: /Finished 617 50.*50/ })).toBeVisible();
  });

  it('is accessible in chart and table views across light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div style={{ width: 280 }}>
          <FunnelChart aria-label="Activation" stages={stages} />
          <FunnelChart aria-label="Activation data" stages={stages} view="table" />
        </div>,
        options,
      );
      const scroller = screen.container.querySelector('[role="region"]')!;
      expect(scroller.getBoundingClientRect().width).toBeLessThanOrEqual(280);
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
