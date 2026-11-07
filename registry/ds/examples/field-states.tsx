import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldStates() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextField label="User ID" defaultValue="48213" isReadOnly description="Read only" />
      <TextField label="Country" defaultValue="United Kingdom" isDisabled description="Disabled" />
      <TextField
        label="Email"
        type="email"
        defaultValue="alex.morgan@"
        isInvalid
        errorMessage="Enter a complete email address."
      />
      <TextField
        label="Email"
        type="email"
        variant="soft"
        defaultValue="alex.morgan@"
        isInvalid
        errorMessage="Enter a complete email address."
      />
    </div>
  );
}
