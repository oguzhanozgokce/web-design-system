import { Checkbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox isDisabled>Archive closed ledgers</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Two-factor sign-in
      </Checkbox>
      <Checkbox isDisabled isIndeterminate>
        Sync every bank account
      </Checkbox>
    </div>
  );
}
