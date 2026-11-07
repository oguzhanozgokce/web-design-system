import { KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {(['soft', 'ghost'] as const).map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <KbdCombo keys={['mod', 'shift', 'P']} variant={variant} />
          <span className="text-xs font-medium text-on-surface-variant">{variant}</span>
        </div>
      ))}
    </div>
  );
}
