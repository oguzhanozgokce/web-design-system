import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldDemo() {
  return (
    <SearchField
      className="w-full max-w-md"
      shape="pill"
      shortcut="/"
      placeholder="Search invoices and orders"
    />
  );
}
