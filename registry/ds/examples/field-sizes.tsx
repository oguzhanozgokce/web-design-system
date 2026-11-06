import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldSizes() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TextField size="sm" label="Small, 36 px" placeholder="Filter rows" />
      <TextField size="md" label="Medium, 40 px" placeholder="Username" />
      <TextField size="lg" label="Large, 48 px" placeholder="name@example.com" />
    </div>
  );
}
