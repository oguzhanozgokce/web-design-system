import { CardHeader, SelectableCard, SelectableCardGroup } from '@/registry/ds/ui/card';

const topics = [
  { value: 'overdue', title: 'Overdue invoices', description: 'The morning after the due date.' },
  { value: 'payouts', title: 'Payouts', description: 'When money reaches your bank.' },
  { value: 'members', title: 'New members', description: 'When someone joins the workspace.' },
  { value: 'digest', title: 'Weekly digest', description: 'Monday at 09:00, your time zone.' },
];

export default function CardSelectableMultiple() {
  return (
    <SelectableCardGroup
      selectionMode="multiple"
      label="Email me about"
      orientation="horizontal"
      defaultValue={['overdue', 'digest']}
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
