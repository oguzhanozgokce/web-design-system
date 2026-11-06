import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupHorizontal() {
  return (
    <RadioGroup label="Billing cycle" orientation="horizontal" defaultValue="yearly">
      <Radio value="monthly">Monthly</Radio>
      <Radio value="quarterly">Quarterly</Radio>
      <Radio value="yearly">Yearly</Radio>
    </RadioGroup>
  );
}
