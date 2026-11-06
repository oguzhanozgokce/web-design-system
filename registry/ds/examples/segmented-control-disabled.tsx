import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlDisabled() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl aria-label="Export format" defaultSelectedKeys={['csv']}>
        <SegmentedControlItem id="csv">CSV</SegmentedControlItem>
        <SegmentedControlItem id="xlsx">XLSX</SegmentedControlItem>
        <SegmentedControlItem id="pdf" isDisabled>
          PDF
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl
        aria-label="Payout schedule"
        variant="thumb"
        isDisabled
        defaultSelectedKeys={['weekly']}
      >
        <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
        <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
        <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-body-sm text-on-surface-variant">
        PDF export and payout changes need an owner role.
      </p>
    </div>
  );
}
