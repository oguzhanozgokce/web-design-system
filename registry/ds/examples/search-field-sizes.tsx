import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldSizes() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <SearchField size="sm" placeholder="Filter rows" />
      <SearchField size="md" placeholder="Search members" />
      <SearchField size="lg" placeholder="Search the help centre" />
    </div>
  );
}
