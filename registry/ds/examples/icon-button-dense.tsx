import { CloseIcon, EditIcon, MoreHorizontalIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

const files = ['Holiday photos', 'Team notes', 'Storage report'];

export default function IconButtonDense() {
  return (
    <div className="w-full max-w-sm rounded-container border border-outline-subtle bg-surface-raised p-2 text-on-surface">
      <div className="flex items-center justify-between ps-2">
        <p className="text-sm font-semibold">Recent files</p>
        <IconButton size="sm" aria-label="Close recent files" icon={<CloseIcon />} />
      </div>
      <ul className="mt-1 flex flex-col">
        {files.map((file) => (
          <li
            key={file}
            className="flex items-center gap-1 rounded-item py-1 ps-2 pe-1 text-sm hover:bg-neutral-soft"
          >
            <span className="min-w-0 flex-1 truncate">{file}</span>
            <IconButton size="xs" aria-label={`Rename ${file}`} icon={<EditIcon />} />
            <IconButton
              size="xs"
              aria-label={`More actions for ${file}`}
              icon={<MoreHorizontalIcon />}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
