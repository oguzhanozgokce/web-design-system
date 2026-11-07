import { FunnelChart } from '@/registry/ds/ui/funnel-chart';

export default function FunnelChartTable() {
  return (
    <FunnelChart
      aria-label="Activation data"
      view="table"
      className="w-full"
      stages={[
        { id: 'installed', label: 'Installed', value: 100 },
        { id: 'signed-in', label: 'Signed in', value: 70 },
        { id: 'active', label: 'First action', value: 0 },
      ]}
    />
  );
}
