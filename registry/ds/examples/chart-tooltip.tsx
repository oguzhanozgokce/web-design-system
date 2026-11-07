import { ChartTooltip } from '@/registry/ds/ui/chart';

export default function ChartTooltipExample() {
  return (
    <ChartTooltip
      title="Thursday"
      total="1,212"
      items={[
        { id: 'direct', label: 'Direct', value: '574', color: 'chart-1' },
        { id: 'search', label: 'Search', value: '402', color: 'chart-2' },
        { id: 'social', label: 'Social', value: '236', color: 'chart-3' },
      ]}
    />
  );
}
