import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldNecessity() {
  return (
    <div className="grid w-full max-w-xl gap-8 sm:grid-cols-2">
      <div className="grid gap-4">
        <p className="text-title-sm text-on-surface">Mark required fields</p>
        <TextField label="Legal name" isRequired />
        <TextField label="VAT number" />
      </div>
      <div className="grid gap-4">
        <p className="text-title-sm text-on-surface">Mark optional fields</p>
        <TextField label="Legal name" isRequired necessityIndicator="label" />
        <TextField label="VAT number" necessityIndicator="label" />
      </div>
    </div>
  );
}
