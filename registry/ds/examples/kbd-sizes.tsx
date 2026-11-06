import { Kbd, KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center justify-center gap-3">
          <KbdCombo size={size} keys={['mod', 'K']} />
          <KbdCombo size={size} keys={['mod', 'shift', 'Z']} />
          <Kbd size={size}>escape</Kbd>
          <Kbd size={size}>/</Kbd>
        </div>
      ))}
    </div>
  );
}
