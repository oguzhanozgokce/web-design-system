import { brandMarkPath } from '@/lib/brand';
import { cn } from '@/registry/ds/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="32"
      height="32"
      viewBox="0 0 48 48"
      fill="currentColor"
      fillRule="evenodd"
      className={cn('size-8 shrink-0', className)}
    >
      <path d={brandMarkPath} />
    </svg>
  );
}
