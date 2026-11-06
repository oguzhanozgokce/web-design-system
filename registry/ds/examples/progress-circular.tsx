import { CircularProgress } from '@/registry/ds/ui/progress';

export default function ProgressCircular() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <CircularProgress
          key={size}
          size={size}
          value={68}
          aria-label={`Onboarding, size ${size}`}
        />
      ))}
    </div>
  );
}
