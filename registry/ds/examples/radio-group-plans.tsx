import { GroupIcon, PersonIcon, VerifiedIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupPlans() {
  return (
    <RadioGroup
      label="Plan"
      description="You can change plans at any time."
      variant="card"
      orientation="horizontal"
      defaultValue="pro"
      className="w-full"
    >
      <Radio value="basic" icon={<PersonIcon />} description="3 projects and 1 GB of storage.">
        Basic
      </Radio>
      <Radio
        value="pro"
        icon={<VerifiedIcon />}
        description="Unlimited projects and 100 GB of storage."
      >
        Pro
      </Radio>
      <Radio value="team" icon={<GroupIcon />} description="Everything in Pro, plus shared spaces.">
        Team
      </Radio>
    </RadioGroup>
  );
}
