import { EditIcon } from '@/registry/ds/lib/icons';
import { Fab } from '@/registry/ds/ui/fab';

export default function FabSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {(['md', 'lg'] as const).map((size) => (
        <Fab key={size} size={size} aria-label={`Write, size ${size}`} icon={<EditIcon />} />
      ))}
    </div>
  );
}
