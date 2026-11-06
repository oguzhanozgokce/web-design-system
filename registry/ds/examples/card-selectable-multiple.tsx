import { CardHeader, SelectableCard, SelectableCardGroup } from '@/registry/ds/ui/card';

const topics = [
  { value: 'comments', title: 'Comments', description: 'When someone replies to you.' },
  { value: 'mentions', title: 'Mentions', description: 'When someone tags you by name.' },
  { value: 'members', title: 'New members', description: 'When someone joins your team.' },
  { value: 'digest', title: 'Weekly digest', description: 'Monday at 09:00, your time zone.' },
];

export default function CardSelectableMultiple() {
  return (
    <SelectableCardGroup
      selectionMode="multiple"
      label="Email me about"
      orientation="horizontal"
      defaultValue={['comments', 'digest']}
      padding="sm"
      className="w-full"
    >
      {topics.map((topic) => (
        <SelectableCard key={topic.value} value={topic.value}>
          <CardHeader title={topic.title} description={topic.description} />
        </SelectableCard>
      ))}
    </SelectableCardGroup>
  );
}
