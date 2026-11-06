import { FilterIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const topics = [
  { id: 'art', name: 'Art', keywords: ['painting', 'drawing'] },
  { id: 'music', name: 'Music', keywords: ['songs', 'concerts'] },
  { id: 'science', name: 'Science', keywords: ['physics', 'biology'] },
  { id: 'sports', name: 'Sports', keywords: ['football', 'tennis'] },
  { id: 'travel', name: 'Travel', keywords: ['flights', 'hotels'] },
  { id: 'food', name: 'Food', keywords: ['recipes', 'cooking'] },
];

export default function ComboBoxMultiple() {
  return (
    <ComboBox
      label="Topics"
      placeholder="Search"
      description="Results match any of these topics."
      selectionMode="multiple"
      defaultItems={topics}
      defaultValue={['art', 'music']}
      startAdornment={<FilterIcon />}
      className="w-full max-w-xs"
    >
      {(topic) => <ListBoxItem keywords={topic.keywords}>{topic.name}</ListBoxItem>}
    </ComboBox>
  );
}
