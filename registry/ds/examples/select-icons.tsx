import {
  BarChartIcon,
  CalendarMonthIcon,
  GridViewIcon,
  SortIcon,
  TableRowsIcon,
} from '@/registry/ds/lib/icons';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectIcons() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Select label="Default view" defaultValue="board">
        <ListBoxItem id="table" startIcon={<TableRowsIcon />}>
          Table
        </ListBoxItem>
        <ListBoxItem id="board" startIcon={<GridViewIcon />}>
          Board
        </ListBoxItem>
        <ListBoxItem id="chart" startIcon={<BarChartIcon />}>
          Chart
        </ListBoxItem>
        <ListBoxItem id="calendar" startIcon={<CalendarMonthIcon />}>
          Calendar
        </ListBoxItem>
      </Select>
      <Select label="Sort transactions" startAdornment={<SortIcon />} defaultValue="newest">
        <ListBoxItem id="newest">Newest first</ListBoxItem>
        <ListBoxItem id="oldest">Oldest first</ListBoxItem>
        <ListBoxItem id="amount">Largest amount</ListBoxItem>
      </Select>
    </div>
  );
}
