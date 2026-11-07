import { AddIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <IconButton
          key={size}
          size={size}
          variant="soft"
          aria-label={`Add, size ${size}`}
          icon={<AddIcon />}
        />
      ))}
    </div>
  );
}
