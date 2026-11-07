import { DeleteIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const tones = ['primary', 'neutral', 'error'] as const;

export default function ButtonTones() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tones.map((tone) =>
        variants.map((variant) => (
          <Button
            key={`${tone}-${variant}`}
            variant={variant}
            tone={tone}
            startIcon={tone === 'error' ? <DeleteIcon /> : undefined}
          >
            {tone === 'error' ? 'Delete' : tone === 'primary' ? 'Publish' : 'Rename'}
          </Button>
        )),
      )}
    </div>
  );
}
