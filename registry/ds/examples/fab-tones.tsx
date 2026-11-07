import { AddIcon, ChatIcon } from '@/registry/ds/lib/icons';
import { Fab } from '@/registry/ds/ui/fab';

export default function FabTones() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Fab tone="primary" aria-label="Add" icon={<AddIcon />} />
      <Fab tone="neutral" aria-label="Message" icon={<ChatIcon />} />
    </div>
  );
}
