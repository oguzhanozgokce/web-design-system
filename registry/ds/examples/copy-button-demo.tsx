import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-container-low py-2 ps-4 pe-2">
      <div className="flex flex-col">
        <span className="text-label-md text-on-surface-variant">Share link</span>
        <code className="font-mono text-body-md text-on-surface">example.com/s/7Q4M2K</code>
      </div>
      <CopyButton value="https://example.com/s/7Q4M2K" aria-label="Copy share link" />
    </div>
  );
}
