import { Avatar } from '@/registry/ds/ui/avatar';

const members = [
  'Ayşe Demir',
  'Mehmet Kaya',
  'Elif Şahin',
  'Can Yılmaz',
  'Zeynep Arslan',
  'Burak Öztürk',
  'Selin Aydın',
  'Emre Koç',
];

export default function AvatarColors() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Avatar name="Payroll bot" tone="neutral" />
        <Avatar name="Support" tone="tertiary" />
      </div>
    </div>
  );
}
