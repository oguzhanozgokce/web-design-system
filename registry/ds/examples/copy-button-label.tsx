import { CopyButton } from '@/registry/ds/ui/copy-button';

const inviteLink = 'https://app.example.com/join/acme-finance/7Q4M2K';

export default function CopyButtonLabel() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 truncate rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2.25 font-mono text-body-md text-on-surface">
        {inviteLink}
      </code>
      <CopyButton value={inviteLink} variant="tonal">
        Copy invite link
      </CopyButton>
    </div>
  );
}
