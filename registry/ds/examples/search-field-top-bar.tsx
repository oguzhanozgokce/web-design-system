import { TuneIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldTopBar() {
  return (
    <header className="flex w-full max-w-2xl items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised p-2">
      <span className="hidden ps-2 text-base font-semibold text-on-surface sm:inline">Photos</span>
      <SearchField
        className="flex-1"
        variant="soft"
        aria-label="Search photos"
        placeholder="Search"
        endAdornment={
          <Button variant="ghost" size="sm" startIcon={<TuneIcon />}>
            Filters
          </Button>
        }
      />
    </header>
  );
}
