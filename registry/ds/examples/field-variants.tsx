import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextField label="Username" description="Outlined, the default." defaultValue="alexmorgan" />
      <TextField
        label="Username"
        variant="filled"
        description="Filled, for dense or tinted surfaces."
        defaultValue="alexmorgan"
      />
    </div>
  );
}
