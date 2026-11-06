import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressThickness() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress label="Profile completeness" value={60} showValueLabel />
      <LinearProgress label="Quarterly sales target" value={72} thickness={8} showValueLabel />
    </div>
  );
}
