import { Checkbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxDescription() {
  return (
    <Checkbox
      defaultSelected
      description="Get an email when a new feature ships or something important changes."
      className="max-w-sm"
    >
      Product updates
    </Checkbox>
  );
}
