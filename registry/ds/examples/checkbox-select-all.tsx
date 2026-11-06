import { Checkbox, CheckboxGroup, SelectAllCheckbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxSelectAll() {
  return (
    <CheckboxGroup
      label="Accountant permissions"
      description="Owners always have every permission."
      defaultValue={['view-ledgers', 'export']}
    >
      <SelectAllCheckbox />
      <div className="flex flex-col gap-3 ps-7.5">
        <Checkbox value="view-ledgers">View ledgers</Checkbox>
        <Checkbox value="edit-entries">Edit entries</Checkbox>
        <Checkbox value="export">Export reports</Checkbox>
        <Checkbox value="approve">Approve payouts</Checkbox>
        <Checkbox value="billing" isDisabled>
          Manage billing
        </Checkbox>
      </div>
    </CheckboxGroup>
  );
}
