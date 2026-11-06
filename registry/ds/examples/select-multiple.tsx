import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select, type SelectValueDisplay } from '@/registry/ds/ui/select';

const channels = [
  { id: 'email', name: 'Email' },
  { id: 'push', name: 'Push' },
  { id: 'sms', name: 'SMS' },
  { id: 'slack', name: 'Slack' },
  { id: 'webhook', name: 'Webhook' },
];

const displays: { display: SelectValueDisplay; label: string; description: string }[] = [
  { display: 'text', label: 'Payment reminders', description: 'Every channel, by name.' },
  { display: 'count', label: 'Weekly summary', description: 'How many channels are on.' },
  { display: 'chips', label: 'Failed payouts', description: 'The first two, then a count.' },
];

export default function SelectMultiple() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      {displays.map(({ display, label, description }) => (
        <Select
          key={display}
          label={label}
          description={description}
          selectionMode="multiple"
          valueDisplay={display}
          items={channels}
          defaultValue={['email', 'push', 'slack']}
        >
          {(channel) => <ListBoxItem>{channel.name}</ListBoxItem>}
        </Select>
      ))}
    </div>
  );
}
