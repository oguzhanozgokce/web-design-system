import { Divider } from '@/registry/ds/ui/divider';

const days = [
  {
    label: 'Today',
    events: ['Ayşe approved INV-2048', 'Payout of 2,400.00 USD reached Garanti BBVA'],
  },
  {
    label: 'Yesterday',
    events: ['Mehmet imported 128 transactions', 'Lena joined as a viewer'],
  },
];

export default function DividerLabelPosition() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-on-surface">
      {days.map((day) => (
        <section key={day.label} className="flex flex-col gap-2">
          <Divider labelPosition="start">{day.label}</Divider>
          <ul className="flex flex-col gap-1 text-body-md">
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
