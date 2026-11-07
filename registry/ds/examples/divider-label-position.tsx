import { Divider } from '@/registry/ds/ui/divider';

const days = [
  {
    label: 'Today',
    events: ['Alex commented on your photo', 'You uploaded 12 photos'],
  },
  {
    label: 'Yesterday',
    events: ['Kenji joined the team', 'You changed your password'],
  },
];

export default function DividerLabelPosition() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-on-surface">
      {days.map((day) => (
        <section key={day.label} className="flex flex-col gap-2">
          <Divider labelPosition="start">{day.label}</Divider>
          <ul className="flex flex-col gap-1 text-sm">
            {day.events.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </section>
      ))}
      <Divider labelPosition="end">End of activity</Divider>
    </div>
  );
}
