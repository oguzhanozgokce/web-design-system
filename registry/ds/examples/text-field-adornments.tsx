import { SearchIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

export default function TextFieldAdornments() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TextField
        label="Company website"
        type="url"
        startAdornment="https://"
        placeholder="acme.com"
      />
      <TextField label="Parcel weight" inputMode="decimal" endAdornment="kg" placeholder="2.5" />
      <TextField
        label="Find a member"
        type="search"
        startAdornment={<SearchIcon />}
        placeholder="Name or email"
      />
    </div>
  );
}
