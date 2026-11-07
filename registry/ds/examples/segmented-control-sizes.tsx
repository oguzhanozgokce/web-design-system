import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SegmentedControl
          key={size}
          aria-label={`Calendar view, ${size}`}
          size={size}
          defaultSelectedKeys={['week']}
        >
          <SegmentedControlItem id="day">Day</SegmentedControlItem>
          <SegmentedControlItem id="week">Week</SegmentedControlItem>
          <SegmentedControlItem id="month">Month</SegmentedControlItem>
        </SegmentedControl>
      ))}
    </div>
  );
}
