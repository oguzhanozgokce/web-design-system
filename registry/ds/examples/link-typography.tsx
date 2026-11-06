import { Link } from '@/registry/ds/ui/link';

export default function LinkTypography() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <h3 className="text-headline-sm text-on-surface">
        Close the month in <Link href="#usage">four steps</Link>
      </h3>
      <p className="text-body-sm text-on-surface-variant">
        Exports include every ledger you can see. <Link href="#api">Check your access</Link>.
      </p>
      <Link href="#examples" variant="standalone" showArrow className="self-start text-title-md">
        Start a free trial
      </Link>
    </div>
  );
}
