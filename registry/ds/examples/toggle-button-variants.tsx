import { ToggleButton } from '@/registry/ds/ui/toggle-button';

const variants = ['soft', 'ghost'] as const;

export default function ToggleButtonVariants() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {variants.map((variant) =>
        [false, true].map((selected) => (
          <ToggleButton key={`${variant}-${selected}`} variant={variant} defaultSelected={selected}>
            {variant === 'soft' ? 'Soft' : 'Ghost'}
          </ToggleButton>
        )),
      )}
    </div>
  );
}
