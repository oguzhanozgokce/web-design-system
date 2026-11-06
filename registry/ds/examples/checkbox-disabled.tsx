import { Checkbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox isDisabled>Show hidden files</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Automatic updates
      </Checkbox>
      <Checkbox isDisabled isIndeterminate>
        Sync all folders
      </Checkbox>
    </div>
  );
}
