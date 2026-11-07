import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress label="Upload" value={45} size="sm" showValueLabel />
      <LinearProgress label="Profile completeness" value={60} showValueLabel />
      <LinearProgress label="Weekly goal" value={72} size="lg" showValueLabel />
    </div>
  );
}
