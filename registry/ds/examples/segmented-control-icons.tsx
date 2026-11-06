import {
  CalendarMonthIcon,
  GridViewIcon,
  ListIcon,
  TableRowsIcon,
  ViewColumnIcon,
} from '@/registry/ds/lib/icons';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlIcons() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl aria-label="View" defaultSelectedKeys={['board']}>
        <SegmentedControlItem id="list" icon={<ListIcon />}>
          List
        </SegmentedControlItem>
        <SegmentedControlItem id="board" icon={<ViewColumnIcon />}>
          Board
        </SegmentedControlItem>
        <SegmentedControlItem id="calendar" icon={<CalendarMonthIcon />}>
          Calendar
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Layout" variant="thumb" defaultSelectedKeys={['rows']}>
        <SegmentedControlItem id="rows" icon={<TableRowsIcon />} aria-label="Rows" />
        <SegmentedControlItem id="grid" icon={<GridViewIcon />} aria-label="Grid" />
      </SegmentedControl>
    </div>
  );
}
