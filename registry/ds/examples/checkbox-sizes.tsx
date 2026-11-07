import { Checkbox } from '@/registry/ds/ui/checkbox';

export default function CheckboxSizes() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox size="sm" defaultSelected>
        Small, for tables and dense lists
      </Checkbox>
      <Checkbox defaultSelected>Medium, the default</Checkbox>
    </div>
  );
}
