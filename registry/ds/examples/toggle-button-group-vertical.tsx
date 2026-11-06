import { GridViewIcon, ListIcon, TableRowsIcon } from '@/registry/ds/lib/icons';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonGroupVertical() {
  return (
    <ToggleButtonGroup
      aria-label="Layout"
      orientation="vertical"
      buttonVariant="tonal"
      defaultSelectedKeys={['grid']}
      disallowEmptySelection
    >
      <ToggleButton id="list" startIcon={<ListIcon />}>
        List
      </ToggleButton>
      <ToggleButton id="grid" startIcon={<GridViewIcon />}>
        Grid
      </ToggleButton>
      <ToggleButton id="table" startIcon={<TableRowsIcon />}>
        Table
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
