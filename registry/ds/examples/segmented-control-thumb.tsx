import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlThumb() {
  return (
    <SegmentedControl aria-label="Sort by" variant="thumb" defaultSelectedKeys={['newest']}>
      <SegmentedControlItem id="newest">Newest</SegmentedControlItem>
      <SegmentedControlItem id="oldest">Oldest</SegmentedControlItem>
      <SegmentedControlItem id="popular">Most popular</SegmentedControlItem>
    </SegmentedControl>
  );
}
