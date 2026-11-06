import {
  BarChartIcon,
  CalendarMonthIcon,
  GridViewIcon,
  TableRowsIcon,
} from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

export default function ListBoxDemo() {
  return (
    <ListBox
      aria-label="Default ledger view"
      selectionMode="single"
      defaultSelectedKeys={['table']}
      variant="outlined"
      className="w-full max-w-xs"
    >
      <ListBoxItem
        id="table"
        startIcon={<TableRowsIcon />}
        description="Every transaction in a row"
      >
        Table
      </ListBoxItem>
      <ListBoxItem id="board" startIcon={<GridViewIcon />} description="Grouped by category">
        Board
      </ListBoxItem>
      <ListBoxItem id="chart" startIcon={<BarChartIcon />} description="Monthly totals">
        Chart
      </ListBoxItem>
      <ListBoxItem id="calendar" startIcon={<CalendarMonthIcon />} description="By due date">
        Calendar
      </ListBoxItem>
    </ListBox>
  );
}
