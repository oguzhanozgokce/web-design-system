import { SearchIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldAdornments() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TextField label="Website" type="url" startAdornment="https://" placeholder="example.com" />
      <TextField label="Weight" inputMode="decimal" endAdornment="kg" placeholder="2.5" />
      <TextField
        label="Search people"
        type="search"
        startAdornment={<SearchIcon />}
        placeholder="Name or email"
      />
    </div>
  );
}
