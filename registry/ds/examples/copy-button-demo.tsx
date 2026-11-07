import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-3 rounded-field border border-outline-subtle bg-surface-raised py-2 ps-3 pe-2">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-on-surface-variant">Share link</span>
        <code dir="ltr" className="font-mono text-sm text-on-surface">
          example.com/s/7Q4M2K
        </code>
      </div>
      <CopyButton value="https://example.com/s/7Q4M2K" aria-label="Copy share link" />
    </div>
  );
}
