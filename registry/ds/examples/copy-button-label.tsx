import { CopyButton } from '@/registry/ds/ui/copy-button';

const command = 'npm install react-aria-components';

export default function CopyButtonLabel() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
      <code
        dir="ltr"
        className="h-8 min-w-0 truncate rounded-field border border-outline-variant bg-surface-raised px-3 font-mono text-sm leading-7.5 text-on-surface sm:flex-1"
      >
        {command}
      </code>
      <CopyButton value={command}>Copy command</CopyButton>
    </div>
  );
}
