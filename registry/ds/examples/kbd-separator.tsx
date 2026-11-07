import { KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdSeparator() {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-on-surface">
      <p>
        Copy the selection with <KbdCombo keys={['mod', 'C']} separator="+" />
      </p>
      <p>
        Reopen a closed tab with <KbdCombo keys={['mod', 'shift', 'T']} separator="+" />
      </p>
    </div>
  );
}
