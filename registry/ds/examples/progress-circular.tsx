import { CircularProgress } from '@/registry/ds/ui/progress';

export default function ProgressCircular() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <CircularProgress size={size} value={68} aria-label={`Upload, size ${size}`} />
          <span className="text-xs text-on-surface-variant">{size}</span>
        </div>
      ))}
    </div>
  );
}
