import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldDemo() {
  return (
    <TextField
      className="w-full max-w-sm"
      label="Display name"
      description="Shown on your profile."
      defaultValue="Alex Morgan"
      maxLength={40}
      isRequired
    />
  );
}
