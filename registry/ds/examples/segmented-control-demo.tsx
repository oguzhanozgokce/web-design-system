import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlDemo() {
  return (
    <SegmentedControl aria-label="Calendar view" defaultSelectedKeys={['week']}>
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="month">Month</SegmentedControlItem>
      <SegmentedControlItem id="year">Year</SegmentedControlItem>
    </SegmentedControl>
  );
}
