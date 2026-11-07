import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(['ghost', 'soft', 'outline', 'solid'] as const).map((variant) => (
          <CopyButton
            key={variant}
            value="https://example.com/s/7Q4M2K"
            variant={variant}
            aria-label={`Copy link, ${variant}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CopyButton value="https://example.com/s/7Q4M2K">Copy</CopyButton>
        <CopyButton value="https://example.com/s/7Q4M2K" variant="outline">
          Copy link
        </CopyButton>
        <CopyButton value="https://example.com/s/7Q4M2K" variant="ghost">
          Copy
        </CopyButton>
      </div>
    </div>
  );
}
