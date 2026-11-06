import { ToggleButton } from '@/registry/ds/ui/toggle-button';

const variants = ['filled', 'tonal', 'outlined', 'elevated'] as const;

export default function ToggleButtonVariants() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[false, true].map((selected) =>
        variants.map((variant) => (
          <ToggleButton key={`${variant}-${selected}`} variant={variant} defaultSelected={selected}>
            {variant[0].toUpperCase() + variant.slice(1)}
          </ToggleButton>
        )),
      )}
    </div>
  );
}
