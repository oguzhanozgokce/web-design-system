import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextField label="Username" description="Outline, the default." defaultValue="alexmorgan" />
      <TextField
        label="Username"
        variant="soft"
        description="Soft, for toolbars and dense forms."
        defaultValue="alexmorgan"
      />
    </div>
  );
}
