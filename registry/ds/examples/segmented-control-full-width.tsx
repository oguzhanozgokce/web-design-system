import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlFullWidth() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface-container-low p-4 text-on-surface">
      <div>
        <h3 className="text-title-md">Billing cycle</h3>
        <p className="text-body-md text-on-surface-variant">
          You can switch at the end of any billing period.
        </p>
      </div>
      <SegmentedControl
        aria-label="Billing cycle"
        variant="thumb"
        fullWidth
        defaultSelectedKeys={['monthly']}
      >
        <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem id="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Invoice language" fullWidth defaultSelectedKeys={['en']}>
        <SegmentedControlItem id="en">English</SegmentedControlItem>
        <SegmentedControlItem id="tr">Türkçe</SegmentedControlItem>
        <SegmentedControlItem id="de">Deutsch</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
