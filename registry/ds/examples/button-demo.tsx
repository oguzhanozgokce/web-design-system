import { AddIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';

export default function ButtonDemo() {
  return <Button startIcon={<AddIcon />}>New ledger</Button>;
}
