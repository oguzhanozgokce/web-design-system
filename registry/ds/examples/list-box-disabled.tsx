import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

export default function ListBoxDisabled() {
  return (
    <ListBox
      aria-label="Save to"
      selectionMode="single"
      defaultSelectedKeys={['cloud']}
      disabledKeys={['drive']}
      variant="outline"
      className="w-full max-w-xs"
    >
      <ListBoxItem id="device" description="Available offline">
        This device
      </ListBoxItem>
      <ListBoxItem id="cloud" description="Synced across your devices">
        Cloud
      </ListBoxItem>
      <ListBoxItem id="drive" description="Connect a drive to use it">
        External drive
      </ListBoxItem>
    </ListBox>
  );
}
