import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressValueLabel() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress
        label="Fundraising goal"
        value={32400}
        maxValue={50000}
        formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
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
        label="Importing receipts"
        value={128}
        maxValue={300}
        valueLabel="128 of 300 files"
        showValueLabel
      />
    </div>
  );
}
