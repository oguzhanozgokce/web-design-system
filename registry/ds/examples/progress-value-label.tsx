import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressValueLabel() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress
        label="Distance this week"
        value={32.4}
        maxValue={50}
        formatOptions={{ style: 'unit', unit: 'kilometer', maximumFractionDigits: 1 }}
        showValueLabel
      />
      <LinearProgress
        label="Storage"
        value={3.2}
        maxValue={5}
        formatOptions={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
        showValueLabel
      />
      <LinearProgress
        label="Importing photos"
        value={128}
        maxValue={300}
        valueLabel="128 of 300 photos"
        showValueLabel
      />
    </div>
  );
}
