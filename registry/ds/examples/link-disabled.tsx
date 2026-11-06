import { Link } from '@/registry/ds/ui/link';

export default function LinkDisabled() {
  return (
    <div className="flex max-w-sm flex-col items-start gap-2">
      <Link href="#api" variant="standalone" isDisabled>
        Download file
      </Link>
      <p className="text-body-sm text-on-surface-variant">The file is still being prepared.</p>
    </div>
  );
}
