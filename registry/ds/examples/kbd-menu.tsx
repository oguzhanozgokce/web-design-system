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
      className="w-64 rounded-overlay bg-surface-overlay p-1 text-sm text-on-surface shadow-md"
    >
      {actions.map((action) => (
        <li
          key={action.label}
          className="flex h-9 items-center justify-between gap-6 rounded-item px-2.5"
        >
          <span>{action.label}</span>
          <KbdCombo
            keys={action.keys}
            variant="ghost"
            size="sm"
            className="text-xs text-on-surface-variant"
          />
        </li>
      ))}
    </ul>
  );
}
