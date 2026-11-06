import { Badge } from '@/registry/ds/ui/badge';

const tones = ['error', 'primary', 'success', 'warning', 'neutral'] as const;

export default function BadgeTones() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {tones.map((tone) => (
        <div key={tone} className="flex flex-col items-center gap-3">
          <Badge tone={tone} count={8} />
          <span className="text-body-sm text-on-surface-variant">{tone}</span>
        </div>
      ))}
    </div>
  );
}
