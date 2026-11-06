import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <CopyButton
          key={size}
          value="ws_8f3a21c9e4"
          size={size}
          variant="outlined"
          aria-label={`Copy workspace ID, size ${size}`}
        />
      ))}
    </div>
  );
}
