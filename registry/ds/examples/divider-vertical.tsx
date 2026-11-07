import { Toolbar } from 'react-aria-components';
import { DeleteIcon, EditIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Divider } from '@/registry/ds/ui/divider';

export default function DividerVertical() {
  return (
    <Toolbar
      aria-label="Photo actions"
      className="flex flex-wrap items-center gap-1 rounded-control bg-neutral-soft p-1"
    >
      <Button variant="ghost" size="sm" startIcon={<EditIcon />}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" startIcon={<ShareIcon />}>
        Share
      </Button>
      <Divider orientation="vertical" inset="middle" />
      <Button variant="ghost" size="sm" tone="error" startIcon={<DeleteIcon />}>
        Delete
      </Button>
    </Toolbar>
  );
}
