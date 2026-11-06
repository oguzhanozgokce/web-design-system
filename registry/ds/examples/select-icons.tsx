import {
  CalendarMonthIcon,
  GridViewIcon,
  ListIcon,
  SortIcon,
  ViewColumnIcon,
} from '@/registry/ds/lib/icons';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectIcons() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Select label="View" defaultValue="grid">
        <ListBoxItem id="list" startIcon={<ListIcon />}>
          List
        </ListBoxItem>
        <ListBoxItem id="grid" startIcon={<GridViewIcon />}>
          Grid
        </ListBoxItem>
        <ListBoxItem id="board" startIcon={<ViewColumnIcon />}>
          Board
        </ListBoxItem>
        <ListBoxItem id="calendar" startIcon={<CalendarMonthIcon />}>
          Calendar
        </ListBoxItem>
      </Select>
      <Select label="Sort by" startAdornment={<SortIcon />} defaultValue="newest">
        <ListBoxItem id="newest">Newest first</ListBoxItem>
        <ListBoxItem id="oldest">Oldest first</ListBoxItem>
        <ListBoxItem id="name">Name</ListBoxItem>
      </Select>
    </div>
  );
}
