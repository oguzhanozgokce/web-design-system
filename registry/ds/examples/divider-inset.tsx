import { Divider, type DividerInset } from '@/registry/ds/ui/divider';

const insets: { inset: DividerInset; label: string }[] = [
  { inset: 'none', label: 'Full width' },
  { inset: 'start', label: 'Start inset' },
  { inset: 'middle', label: 'Middle inset' },
];

export default function DividerInsetExample() {
  return (
    <div className="flex w-full max-w-md flex-col rounded-container border border-outline-subtle bg-surface-raised py-1 text-on-surface">
      {insets.map((item) => (
        <div key={item.inset} className="flex flex-col">
          <span className="px-4 py-3 text-sm">{item.label}</span>
          <Divider inset={item.inset} />
        </div>
      ))}
      <span className="px-4 py-3 text-sm">Next row</span>
    </div>
  );
}
