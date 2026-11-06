import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldStates() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextField label="Workspace ID" defaultValue="ws_48213" isReadOnly description="Read only" />
      <TextField label="Region" defaultValue="eu-west-1" isDisabled description="Disabled" />
      <TextField
        label="IBAN"
        defaultValue="DE89 3704 0044 0532 0130"
        isInvalid
        errorMessage="This IBAN has 2 digits too few."
      />
      <TextField
        label="IBAN"
        variant="filled"
        defaultValue="DE89 3704 0044 0532 0130"
        isInvalid
        errorMessage="This IBAN has 2 digits too few."
      />
    </div>
  );
}
