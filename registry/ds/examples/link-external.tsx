import { Link } from '@/registry/ds/ui/link';

export default function LinkExternal() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-on-surface">
        Copy buttons rely on the{' '}
        <Link href="https://developer.mozilla.org/docs/Web/API/Clipboard_API" isExternal>
          Clipboard API
        </Link>
        , which needs a secure context.
      </p>
      <Link
        href="https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context"
        variant="standalone"
        isExternal
        className="self-start"
      >
        WCAG link purpose guidance
      </Link>
    </div>
  );
}
