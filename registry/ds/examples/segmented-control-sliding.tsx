import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlSliding() {
  return (
    <SegmentedControl aria-label="Sort by" defaultSelectedKeys={['newest']}>
      <SegmentedControlItem id="newest">Newest</SegmentedControlItem>
      <SegmentedControlItem id="oldest">Oldest</SegmentedControlItem>
      <SegmentedControlItem id="popular">Most popular</SegmentedControlItem>
    </SegmentedControl>
  );
}
