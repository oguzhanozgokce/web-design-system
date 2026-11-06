import { GroupIcon, PersonIcon, VerifiedIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupPlans() {
  return (
    <RadioGroup
      label="Plan"
      description="You can switch plans at any time. We prorate the difference."
      variant="card"
      orientation="horizontal"
      defaultValue="team"
      className="w-full"
    >
      <Radio value="starter" icon={<PersonIcon />} description="Free. One ledger and one member.">
        Starter
      </Radio>
      <Radio
        value="team"
        icon={<GroupIcon />}
        description="12 USD per member a month. Unlimited ledgers and shared reports."
      >
        Team
      </Radio>
      <Radio
        value="business"
        icon={<VerifiedIcon />}
        description="29 USD per member a month. Approvals, audit log and SSO."
      >
        Business
      </Radio>
    </RadioGroup>
  );
}
