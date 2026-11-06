import { KbdCombo } from '@/registry/ds/ui/kbd';

export default function KbdDemo() {
  return (
    <p className="text-body-md text-on-surface">
      Press <KbdCombo keys={['mod', 'K']} /> to search.
    </p>
  );
}
