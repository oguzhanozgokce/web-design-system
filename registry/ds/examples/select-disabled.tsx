import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectDisabled() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Select
        label="Plan"
        defaultValue="team"
        disabledKeys={['enterprise']}
        description="Enterprise needs a sales contract."
      >
        <ListBoxItem id="starter">Starter</ListBoxItem>
        <ListBoxItem id="team">Team</ListBoxItem>
        <ListBoxItem id="enterprise">Enterprise</ListBoxItem>
      </Select>
      <Select
        label="Workspace region"
        defaultValue="eu"
        isDisabled
        description="Fixed once the workspace is created."
      >
        <ListBoxItem id="eu">Europe (Frankfurt)</ListBoxItem>
        <ListBoxItem id="us">United States (Virginia)</ListBoxItem>
      </Select>
    </div>
  );
}
