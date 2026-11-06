import { Divider } from '@/registry/ds/ui/divider';

const members = [
  { initials: 'AD', name: 'Ayşe Demir', role: 'Owner' },
  { initials: 'MK', name: 'Mehmet Kaya', role: 'Accountant' },
  { initials: 'LS', name: 'Lena Schmidt', role: 'Viewer' },
];

export default function DividerList() {
  return (
    <ul className="flex w-full max-w-md flex-col rounded-lg bg-surface-container-low py-2 text-on-surface">
      {members.map((member, index) => (
        <li key={member.name} className="flex flex-col">
          {index > 0 ? <Divider inset="start" className="[--divider-inset:4.5rem]" /> : null}
          <div className="flex items-center gap-4 px-4 py-2">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-container text-title-sm text-on-primary-container"
            >
              {member.initials}
            </span>
            <span className="flex flex-col">
              <span className="text-body-lg">{member.name}</span>
              <span className="text-body-md text-on-surface-variant">{member.role}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
