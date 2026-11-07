import { Link } from '@/registry/ds/ui/link';

export default function LinkTypography() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <h3 className="text-2xl font-semibold tracking-tight text-on-surface">
        Get started in <Link href="#usage">three steps</Link>
      </h3>
      <p className="text-xs text-on-surface-variant">
        Shared files are visible to everyone in the folder.{' '}
        <Link href="#api" tone="inherit">
          Check who has access
        </Link>
        .
      </p>
      <Link href="#examples" variant="standalone" showArrow className="self-start text-base">
        Learn more
      </Link>
    </div>
  );
}
