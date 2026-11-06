import { CalendarMonthIcon, GridViewIcon, ListIcon, ViewColumnIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

export default function ListBoxDemo() {
  return (
    <ListBox
      aria-label="Layout"
      selectionMode="single"
      defaultSelectedKeys={['list']}
      variant="outlined"
      className="w-full max-w-xs"
    >
      <ListBoxItem id="list" startIcon={<ListIcon />} description="One item per row">
        List
      </ListBoxItem>
      <ListBoxItem id="grid" startIcon={<GridViewIcon />} description="Large previews">
        Grid
      </ListBoxItem>
      <ListBoxItem id="board" startIcon={<ViewColumnIcon />} description="Grouped into columns">
        Board
      </ListBoxItem>
      <ListBoxItem id="calendar" startIcon={<CalendarMonthIcon />} description="Placed by date">
        Calendar
      </ListBoxItem>
    </ListBox>
  );
}
