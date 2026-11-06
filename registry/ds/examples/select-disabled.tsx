import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectDisabled() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Select
        label="Save to"
        defaultValue="cloud"
        disabledKeys={['drive']}
        description="Connect a drive to save there."
      >
        <ListBoxItem id="device">This device</ListBoxItem>
        <ListBoxItem id="cloud">Cloud</ListBoxItem>
        <ListBoxItem id="drive">External drive</ListBoxItem>
      </Select>
      <Select
        label="Region"
        defaultValue="eu"
        isDisabled
        description="Set when the account was created."
      >
        <ListBoxItem id="eu">Europe</ListBoxItem>
        <ListBoxItem id="us">United States</ListBoxItem>
      </Select>
    </div>
  );
}
