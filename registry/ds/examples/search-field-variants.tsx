import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <SearchField label="Customers" description="Outlined, the default." />
      <SearchField
        label="Customers"
        variant="filled"
        description="Filled, for dense or tinted surfaces."
      />
      <SearchField
        className="sm:col-span-2"
        label="Customers"
        shape="pill"
        description="Pill, the Material 3 search bar for top bars."
      />
    </div>
  );
}
