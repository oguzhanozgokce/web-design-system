import { Checkbox, CheckboxGroup, SelectAllCheckbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxSelectAll() {
  return (
    <CheckboxGroup
      label="Permissions"
      description="Owners always have every permission."
      defaultValue={['view', 'comment']}
    >
      <SelectAllCheckbox />
      <div className="flex flex-col gap-3 ps-7.5">
        <Checkbox value="view">View</Checkbox>
        <Checkbox value="comment">Comment</Checkbox>
        <Checkbox value="edit">Edit</Checkbox>
        <Checkbox value="share">Share</Checkbox>
        <Checkbox value="delete" isDisabled>
          Delete
        </Checkbox>
      </div>
    </CheckboxGroup>
  );
}
