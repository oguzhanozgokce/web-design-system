import { KbdCombo, type KbdKey } from '@/registry/ds/ui/kbd';

const actions: { label: string; keys: KbdKey[] }[] = [
  { label: 'Copy', keys: ['mod', 'C'] },
  { label: 'Cut', keys: ['mod', 'X'] },
  { label: 'Paste', keys: ['mod', 'V'] },
  { label: 'Delete', keys: ['backspace'] },
];

export default function KbdMenu() {
  return (
    <ul
      aria-label="Edit"
      className="w-64 rounded-sm bg-surface-container py-2 text-body-md text-on-surface shadow-elevation-2"
    >
      {actions.map((action) => (
        <li key={action.label} className="flex h-10 items-center justify-between gap-6 px-3">
          <span>{action.label}</span>
          <KbdCombo keys={action.keys} variant="text" className="text-on-surface-variant" />
        </li>
      ))}
    </ul>
  );
}
