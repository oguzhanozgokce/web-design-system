import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlDisabled() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl aria-label="Video quality" defaultSelectedKeys={['auto']}>
        <SegmentedControlItem id="auto">Auto</SegmentedControlItem>
        <SegmentedControlItem id="720p">720p</SegmentedControlItem>
        <SegmentedControlItem id="1080p">1080p</SegmentedControlItem>
        <SegmentedControlItem id="4k" isDisabled>
          4K
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl
        aria-label="Backup frequency"
        variant="thumb"
        isDisabled
        defaultSelectedKeys={['weekly']}
      >
        <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
        <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
        <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-center text-body-sm text-on-surface-variant">
        4K is not available for this video. Your administrator sets how often backups run.
      </p>
    </div>
  );
}
