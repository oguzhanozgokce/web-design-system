import { Avatar } from '@/registry/ds/ui/avatar';

const names = [
  'Ayşe Nur Demir',
  'ilkay şahin',
  'Defne',
  'Nguyễn Văn An',
  'Наталья Петрова',
  'محمد علي',
  '王芳',
  '山田 太郎',
  'สมชาย ใจดี',
];

export default function AvatarInitials() {
  return (
    <ul className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-3">
          <Avatar name={name} alt="" size="sm" />
          <span className="text-body-md text-on-surface">{name}</span>
        </li>
      ))}
    </ul>
  );
}
