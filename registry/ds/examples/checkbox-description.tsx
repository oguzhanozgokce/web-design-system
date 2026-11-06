import { Checkbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxDescription() {
  return (
    <Checkbox
      defaultSelected
      description="Customers get a reminder three days before the due date and again on the day."
      className="max-w-sm"
    >
      Send payment reminders
    </Checkbox>
  );
}
