import { ChartLegend } from '@/registry/ds/ui/chart';

export default function ChartLegendExample() {
  return (
    <div className="flex flex-col gap-4">
      <ChartLegend
        items={[
          { id: 'photos', label: 'Photos', color: 'chart-1' },
          { id: 'videos', label: 'Videos', color: 'chart-2' },
          { id: 'music', label: 'Music', color: 'chart-3' },
          { id: 'documents', label: 'Documents', color: 'chart-4' },
        ]}
      />
      <ChartLegend
        items={[
          { id: 'this-year', label: 'This year', color: 'primary', marker: 'line' },
          { id: 'last-year', label: 'Last year', color: 'neutral', marker: 'dashed' },
          { id: 'bounced', label: 'Bounced', color: 'mono-1', texture: 'hatched' },
        ]}
      />
    </div>
  );
}
