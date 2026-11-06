import { CopyButton } from '@/registry/ds/ui/copy-button';

export default function CopyButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <CopyButton
          key={size}
          value="https://example.com/s/7Q4M2K"
          size={size}
          variant="outlined"
          aria-label={`Copy link, size ${size}`}
        />
      ))}
    </div>
  );
}
