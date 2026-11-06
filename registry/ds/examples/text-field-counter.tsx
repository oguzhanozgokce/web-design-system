import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldCounter() {
  return (
    <TextField
      className="w-full max-w-sm"
      label="Album name"
      description="Everyone you share the album with sees this name."
      defaultValue="Summer trip to Lisbon"
      maxLength={32}
    />
  );
}
