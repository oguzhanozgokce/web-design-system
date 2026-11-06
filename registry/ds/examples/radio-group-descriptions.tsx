import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDescriptions() {
  return (
    <RadioGroup
      label="Payout schedule"
      description="Changes apply from the next business day."
      defaultValue="weekly"
      className="max-w-md"
    >
      <Radio value="daily" description="Funds arrive two business days after each sale.">
        Daily
      </Radio>
      <Radio value="weekly" description="Every Friday, covering sales up to Wednesday.">
        Weekly
      </Radio>
      <Radio value="monthly" description="On the first business day of each month.">
        Monthly
      </Radio>
    </RadioGroup>
  );
}
