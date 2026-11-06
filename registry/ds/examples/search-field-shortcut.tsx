import { SearchField } from '@/registry/ds/ui/search-field';

export default function SearchFieldShortcut() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <SearchField label="Jump to a project" shortcut="p" placeholder="Press P to jump" />
      <SearchField label="Command search" shape="pill" shortcut="Mod+Shift+F" />
    </div>
  );
}
