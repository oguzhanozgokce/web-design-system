import { SearchIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { TextField } from '@/registry/ds/ui/text-field';

export default function FieldHiddenLabel() {
  return (
    <div className="flex w-full max-w-xl flex-wrap items-center gap-3">
      <TextField
        className="min-w-48 flex-1"
        label="Search transactions"
        isLabelHidden
        placeholder="Search transactions"
        startAdornment={<SearchIcon />}
        isClearable
      />
      <Button variant="tonal">Export</Button>
    </div>
  );
}
