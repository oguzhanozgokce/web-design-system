import { MailIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldDemo() {
  return (
    <TextField
      className="w-full max-w-sm"
      label="Email"
      type="email"
      autoComplete="email"
      placeholder="name@example.com"
      description="We never share your email."
      startAdornment={<MailIcon />}
      isRequired
    />
  );
}
