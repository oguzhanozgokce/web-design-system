import { Badge } from '@/registry/ds/ui/badge';

const tones = ['error', 'primary', 'neutral', 'success', 'warning', 'info'] as const;

export default function BadgeTones() {
  return (
    <div className="grid grid-cols-[auto_repeat(6,minmax(0,1fr))] items-center gap-x-6 gap-y-4">
      <span />
      {tones.map((tone) => (
        <span key={tone} className="text-center text-xs text-on-surface-variant">
          {tone}
        </span>
      ))}
      {(['solid', 'soft'] as const).map((variant) => (
        <div key={variant} className="contents">
          <span className="text-xs font-medium text-on-surface-variant">{variant}</span>
          {tones.map((tone) => (
            <span key={tone} className="flex justify-center">
              <Badge variant={variant} tone={tone} count={8} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
