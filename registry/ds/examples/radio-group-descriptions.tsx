import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDescriptions() {
  return (
    <RadioGroup
      label="Email frequency"
      description="You can change this at any time."
      defaultValue="daily"
      className="max-w-md"
    >
      <Radio value="instant" description="An email for every new message.">
        Instantly
      </Radio>
      <Radio value="daily" description="One email each morning with everything new.">
        Daily summary
      </Radio>
      <Radio value="weekly" description="One email every Monday.">
        Weekly summary
      </Radio>
    </RadioGroup>
  );
}
