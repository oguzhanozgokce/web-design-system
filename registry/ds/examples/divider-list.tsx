import { Divider } from '@/registry/ds/ui/divider';

const members = [
  { initials: 'AM', name: 'Alex Morgan', role: 'Owner' },
  { initials: 'KT', name: 'Kenji Tanaka', role: 'Editor' },
  { initials: 'LS', name: 'Lena Schmidt', role: 'Viewer' },
];

export default function DividerList() {
  return (
    <ul className="flex w-full max-w-md flex-col rounded-container border border-outline-subtle bg-surface-raised py-1 text-on-surface">
      {members.map((member, index) => (
        <li key={member.name} className="flex flex-col">
          {index > 0 ? <Divider inset="start" className="[--divider-inset:4rem]" /> : null}
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-on-primary-soft"
            >
              {member.initials}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium">{member.name}</span>
              <span className="text-xs text-on-surface-variant">{member.role}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
