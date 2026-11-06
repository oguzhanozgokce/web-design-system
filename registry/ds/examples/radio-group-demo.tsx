import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDemo() {
  return (
    <RadioGroup label="Theme" defaultValue="system">
      <Radio value="light">Light</Radio>
      <Radio value="dark">Dark</Radio>
      <Radio value="system">System</Radio>
    </RadioGroup>
  );
}
