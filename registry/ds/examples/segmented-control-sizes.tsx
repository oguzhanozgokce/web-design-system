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
            aria-label={`Currency, ${variant} ${size}`}
            variant={variant}
            size={size}
            defaultSelectedKeys={['eur']}
          >
            <SegmentedControlItem id="eur">EUR</SegmentedControlItem>
            <SegmentedControlItem id="usd">USD</SegmentedControlItem>
            <SegmentedControlItem id="try">TRY</SegmentedControlItem>
          </SegmentedControl>
        )),
      )}
    </div>
  );
}
