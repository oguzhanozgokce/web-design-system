import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupHorizontal() {
  return (
    <RadioGroup label="Size" orientation="horizontal" defaultValue="medium">
      <Radio value="small">Small</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="large">Large</Radio>
    </RadioGroup>
  );
}
