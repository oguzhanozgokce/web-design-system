import { Link } from '@/registry/ds/ui/link';

export default function LinkVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface-container-low p-5">
      <div className="flex flex-col gap-1">
        <p className="text-title-md text-on-surface">Invoices</p>
        <p className="text-body-md text-on-surface-variant">
          Three invoices are overdue. Reminders go out weekly unless you{' '}
          <Link href="#api">pause them</Link>.
        </p>
      </div>
      <Link href="#examples" variant="standalone" showArrow className="self-start">
        View all invoices
      </Link>
    </div>
  );
}
