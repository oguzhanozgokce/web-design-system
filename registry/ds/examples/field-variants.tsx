import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextField
        label="Company"
        description="Outlined, the default."
        defaultValue="Northwind Ltd"
      />
      <TextField
        label="Company"
        variant="filled"
        description="Filled, for dense or tinted surfaces."
        defaultValue="Northwind Ltd"
      />
    </div>
  );
}
