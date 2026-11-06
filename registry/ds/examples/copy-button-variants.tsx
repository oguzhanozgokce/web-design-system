import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(['text', 'outlined', 'tonal', 'filled', 'elevated'] as const).map((variant) => (
          <CopyButton key={variant} value="INV-2041" variant={variant} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CopyButton value="INV-2041">Copy</CopyButton>
        <CopyButton value="INV-2041" variant="tonal">
          Copy number
        </CopyButton>
        <CopyButton value="INV-2041" variant="text">
          Copy
        </CopyButton>
      </div>
    </div>
  );
}
