import { CallIcon, LanguageIcon, MailIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldTypes() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        startAdornment={<MailIcon />}
        placeholder="name@example.com"
      />
      <TextField
        label="Website"
        type="url"
        autoComplete="url"
        startAdornment={<LanguageIcon />}
        placeholder="https://example.com"
      />
      <TextField
        label="Phone"
        type="tel"
        autoComplete="tel"
        startAdornment={<CallIcon />}
        placeholder="+44 20 7946 0958"
      />
    </div>
  );
}
