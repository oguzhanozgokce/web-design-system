import { AddIcon } from '@/registry/ds/lib/icons';
import { Fab } from '@/registry/ds/ui/fab';

export default function FabDemo() {
  return <Fab aria-label="Create" icon={<AddIcon />} />;
}
