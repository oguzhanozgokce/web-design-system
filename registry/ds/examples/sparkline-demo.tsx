import { Sparkline } from '@/registry/ds/ui/sparkline';

const tiles = [
  { label: 'Visits', value: '48.2K', data: [31, 34, 33, 38, 41, 39, 44, 47, 46, 52, 55, 58] },
  { label: 'Sign-ups', value: '1,284', data: [12, 15, 14, 18, 17, 16, 21, 19, 24, 23, 27, 26] },
  { label: 'Bounce rate', value: '38%', data: [46, 45, 47, 44, 43, 44, 41, 42, 40, 39, 39, 38] },
];

export default function SparklineDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-end justify-between gap-3 rounded-container border border-outline-subtle bg-surface-raised p-4"
        >
          <div className="flex shrink-0 flex-col gap-1">
            <span className="text-xs whitespace-nowrap text-on-surface-variant">{tile.label}</span>
            <span className="text-xl font-semibold tracking-tight text-on-surface">
              {tile.value}
            </span>
          </div>
          <Sparkline
            aria-label={`${tile.label}, last 12 weeks`}
            data={tile.data}
            variant="area"
            className="h-10 w-full max-w-24 min-w-12"
          />
        </div>
      ))}
    </div>
  );
}
