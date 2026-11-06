import { Tag, TagGroup } from '@/registry/ds/ui/tag';

export default function TagGroupDisabled() {
  return (
    <TagGroup
      label="Access"
      description="Only the owner can change access."
      isDisabled
      onRemove={() => {}}
      className="w-full max-w-sm"
    >
      <Tag id="photos">Photos</Tag>
      <Tag id="calendar">Calendar</Tag>
      <Tag id="contacts">Contacts</Tag>
    </TagGroup>
  );
}
