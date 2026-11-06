import { GroupIcon, LanguageIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupCard() {
  return (
    <RadioGroup
      label="Who can open this report?"
      variant="card"
      defaultValue="team"
      className="w-full max-w-md"
    >
      <Radio value="private" icon={<PersonIcon />} description="Only you can open and edit it.">
        Only me
      </Radio>
      <Radio
        value="team"
        icon={<GroupIcon />}
        description="Everyone in Finance can open it. Editors can change filters."
      >
        My team
      </Radio>
      <Radio
        value="link"
        icon={<LanguageIcon />}
        description="Anyone with the link can view a read-only copy."
      >
        Anyone with the link
      </Radio>
    </RadioGroup>
  );
}
