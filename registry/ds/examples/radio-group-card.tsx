import { GroupIcon, LanguageIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupCard() {
  return (
    <RadioGroup label="Visibility" variant="card" defaultValue="team" className="w-full max-w-md">
      <Radio value="private" icon={<PersonIcon />} description="Only you can see and edit it.">
        Only me
      </Radio>
      <Radio
        value="team"
        icon={<GroupIcon />}
        description="Everyone on your team can see it. Editors can change it."
      >
        Team
      </Radio>
      <Radio
        value="public"
        icon={<LanguageIcon />}
        description="People can view it without signing in."
      >
        Anyone with the link
      </Radio>
    </RadioGroup>
  );
}
