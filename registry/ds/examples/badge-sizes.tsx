import { Badge } from '@/registry/ds/ui/badge';

const cases = [
  { caption: 'Dot', badge: <Badge /> },
  { caption: 'Count', badge: <Badge count={3} /> },
  { caption: 'sm', badge: <Badge count={3} size="sm" /> },
  { caption: 'Over 99', badge: <Badge count={1240} /> },
  { caption: 'max={9}', badge: <Badge count={12} max={9} /> },
  { caption: 'showZero', badge: <Badge count={0} showZero variant="soft" tone="neutral" /> },
];

export default function BadgeSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {cases.map(({ caption, badge }) => (
        <div key={caption} className="flex flex-col items-center gap-3">
          {badge}
          <span className="text-xs text-on-surface-variant">{caption}</span>
        </div>
      ))}
    </div>
  );
}
