import { MailIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldDemo() {
  return (
    <TextField
      className="w-full max-w-sm"
      label="Work email"
      type="email"
      autoComplete="email"
      placeholder="name@company.com"
      description="We send receipts and security alerts here."
      startAdornment={<MailIcon />}
      isRequired
    />
  );
}
