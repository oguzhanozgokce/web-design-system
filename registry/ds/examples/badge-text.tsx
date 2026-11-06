import { Badge } from '@/registry/ds/ui/badge';

const features = [
  { name: 'Recurring invoices', badge: <Badge tone="primary">New</Badge> },
  { name: 'Bank feeds', badge: <Badge tone="neutral">Beta</Badge> },
  { name: 'Payroll export', badge: null },
];

export default function BadgeText() {
  return (
    <ul className="w-full max-w-sm divide-y divide-outline-variant rounded-lg border border-outline-variant text-body-lg text-on-surface">
      {features.map(({ name, badge }) => (
        <li key={name} className="flex items-center gap-2 px-4 py-3">
          {name}
          {badge}
        </li>
      ))}
    </ul>
  );
}
