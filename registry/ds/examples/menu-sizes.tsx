import { ArchiveIcon, CopyIcon, DeleteIcon, EditIcon } from '@/registry/ds/lib/icons';
import {
  MenuItem,
  MenuList,
  MenuSeparator,
  menuPopoverStyles,
  type MenuSize,
} from '@/registry/ds/ui/menu';

const sizes: { size: MenuSize; label: string }[] = [
  { size: 'md', label: 'Default, 48px items' },
  { size: 'sm', label: 'Dense, 40px items' },
];

export default function MenuSizes() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {sizes.map(({ size, label }) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-label-md text-on-surface-variant">{label}</p>
          <div className={menuPopoverStyles({ motion: 'none', className: 'w-56' })}>
            <MenuList aria-label={`Actions, ${label}`} size={size}>
              <MenuItem startIcon={<EditIcon />} shortcut={['mod', 'E']}>
                Edit
              </MenuItem>
              <MenuItem startIcon={<CopyIcon />}>Duplicate</MenuItem>
              <MenuItem startIcon={<ArchiveIcon />}>Archive</MenuItem>
              <MenuSeparator />
              <MenuItem startIcon={<DeleteIcon />} tone="destructive">
                Delete
              </MenuItem>
            </MenuList>
          </div>
        </div>
      ))}
    </div>
  );
}
