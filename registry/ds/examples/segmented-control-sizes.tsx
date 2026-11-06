import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlVariant,
} from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['outlined', 'thumb'] as SegmentedControlVariant[]).map((variant) =>
        (['sm', 'md'] as const).map((size) => (
          <SegmentedControl
            key={`${variant}-${size}`}
            aria-label={`Calendar view, ${variant} ${size}`}
            variant={variant}
            size={size}
            defaultSelectedKeys={['week']}
          >
            <SegmentedControlItem id="day">Day</SegmentedControlItem>
            <SegmentedControlItem id="week">Week</SegmentedControlItem>
            <SegmentedControlItem id="month">Month</SegmentedControlItem>
          </SegmentedControl>
        )),
      )}
    </div>
  );
}
