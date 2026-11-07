import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <SearchField label="Contacts" description="Outline, the default." />
      <SearchField
        label="Contacts"
        variant="soft"
        description="Soft, for search bars in headers and toolbars."
      />
    </div>
  );
}
