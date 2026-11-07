import { ChartCard } from '@/registry/ds/ui/chart-card';
import { FunnelChart } from '@/registry/ds/ui/funnel-chart';

export default function FunnelChartCategorical() {
  return (
    <ChartCard title="Getting started" showTableToggle className="w-full max-w-3xl">
      <FunnelChart
        palette="categorical"
        stages={[
          { id: 'visited', label: 'Visited', value: 5000 },
          { id: 'started', label: 'Started', value: 2800 },
          { id: 'finished', label: 'Finished', value: 1680 },
        ]}
      />
    </ChartCard>
  );
}
