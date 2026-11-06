import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-container-low py-2 ps-4 pe-2">
      <div className="flex flex-col">
        <span className="text-label-md text-on-surface-variant">Workspace ID</span>
        <code className="font-mono text-body-md text-on-surface">ws_8f3a21c9e4</code>
      </div>
      <CopyButton value="ws_8f3a21c9e4" aria-label="Copy workspace ID" />
    </div>
  );
}
