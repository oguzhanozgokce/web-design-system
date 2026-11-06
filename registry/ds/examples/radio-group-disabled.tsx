import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDisabled() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
      <RadioGroup label="Video quality" defaultValue="auto">
        <Radio value="auto">Auto</Radio>
        <Radio value="1080p">1080p</Radio>
        <Radio value="4k" isDisabled description="Not available on this device.">
          4K
        </Radio>
      </RadioGroup>
      <RadioGroup label="Start of the week" defaultValue="monday" isDisabled>
        <Radio value="monday">Monday</Radio>
        <Radio value="saturday">Saturday</Radio>
        <Radio value="sunday">Sunday</Radio>
      </RadioGroup>
    </div>
  );
}
