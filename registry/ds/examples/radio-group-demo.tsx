import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDemo() {
  return (
    <RadioGroup label="Invoice delivery" defaultValue="email">
      <Radio value="email">Email</Radio>
      <Radio value="portal">Customer portal</Radio>
      <Radio value="post">Postal mail</Radio>
    </RadioGroup>
  );
}
