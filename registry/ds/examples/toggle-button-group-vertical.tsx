import { GridViewIcon, ListIcon, TableRowsIcon } from '@/registry/ds/lib/icons';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonGroupVertical() {
  return (
    <ToggleButtonGroup
      aria-label="Project view"
      orientation="vertical"
      buttonVariant="tonal"
      defaultSelectedKeys={['board']}
      disallowEmptySelection
    >
      <ToggleButton id="list" startIcon={<ListIcon />}>
        List
      </ToggleButton>
      <ToggleButton id="board" startIcon={<GridViewIcon />}>
        Board
      </ToggleButton>
      <ToggleButton id="table" startIcon={<TableRowsIcon />}>
        Table
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
