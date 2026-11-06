import { TuneIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldTopBar() {
  return (
    <header className="flex w-full max-w-2xl items-center gap-3 rounded-lg bg-surface-container-low p-2">
      <span className="hidden ps-2 text-title-md text-on-surface sm:inline">Ledger</span>
      <SearchField
        className="flex-1"
        shape="pill"
        aria-label="Search transactions"
        placeholder="Search"
        endAdornment={
          <Button variant="text" size="xs" startIcon={<TuneIcon />}>
            Filters
          </Button>
        }
      />
    </header>
  );
}
