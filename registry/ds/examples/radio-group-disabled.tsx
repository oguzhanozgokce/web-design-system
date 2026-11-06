import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupDisabled() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
      <RadioGroup label="Data region" defaultValue="eu">
        <Radio value="eu">European Union</Radio>
        <Radio value="us">United States</Radio>
        <Radio value="apac" isDisabled description="Available on the Business plan.">
          Asia Pacific
        </Radio>
      </RadioGroup>
      <RadioGroup label="Fiscal year start" defaultValue="january" isDisabled>
        <Radio value="january">January</Radio>
        <Radio value="april">April</Radio>
        <Radio value="july">July</Radio>
      </RadioGroup>
    </div>
  );
}
