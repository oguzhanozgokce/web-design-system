import { KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {(['outlined', 'tonal', 'text'] as const).map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <KbdCombo keys={['mod', 'shift', 'P']} variant={variant} />
          <span className="text-label-md text-on-surface-variant">{variant}</span>
        </div>
      ))}
    </div>
  );
}
