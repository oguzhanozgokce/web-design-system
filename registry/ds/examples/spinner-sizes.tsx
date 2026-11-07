import { Spinner, type SpinnerSize } from '@/registry/ds/ui/spinner';

const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

export default function SpinnerSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <Spinner size={size} tone="primary" />
          <span className="text-xs text-on-surface-variant">{size}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-3">
        <span className="text-2xl text-on-surface">
          <Spinner />
        </span>
        <span className="text-xs text-on-surface-variant">1em</span>
      </div>
    </div>
  );
}
