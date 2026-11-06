import { Link } from '@/registry/ds/ui/link';

export default function LinkDisabled() {
  return (
    <div className="flex max-w-sm flex-col items-start gap-2">
      <Link href="#api" variant="standalone" isDisabled>
        Download November statement
      </Link>
      <p className="text-body-sm text-on-surface-variant">
        Statements are generated on the first day of the next month.
      </p>
    </div>
  );
}
