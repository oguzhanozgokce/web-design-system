import { KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdSeparator() {
  return (
    <div className="flex flex-col items-center gap-3 text-body-md text-on-surface">
      <p>
        Duplicate the line item with <KbdCombo keys={['mod', 'D']} separator="+" />
      </p>
      <p>
        Reopen a closed tab with <KbdCombo keys={['mod', 'shift', 'T']} separator="+" />
      </p>
    </div>
  );
}
