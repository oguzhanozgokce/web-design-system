import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressTones() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress label="Seats used" value={8} maxValue={20} showValueLabel />
      <LinearProgress label="Invoices paid" value={92} tone="success" showValueLabel />
      <LinearProgress label="Storage used" value={84} tone="warning" showValueLabel />
      <LinearProgress label="API quota used" value={97} tone="error" showValueLabel />
    </div>
  );
}
