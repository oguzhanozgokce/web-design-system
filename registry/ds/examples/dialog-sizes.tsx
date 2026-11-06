import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  type DialogSize,
} from '@/registry/ds/ui/dialog';

const sizes: { size: DialogSize; label: string; title: string; body: string }[] = [
  {
    size: 'sm',
    label: 'Small',
    title: 'Rename ledger',
    body: 'Up to 384px wide. Fits one field or a short confirmation.',
  },
  {
    size: 'md',
    label: 'Medium',
    title: 'Invite teammate',
    body: 'Up to 560px wide, the Material 3 maximum for a basic dialog. Fits short forms.',
  },
  {
    size: 'lg',
    label: 'Large',
    title: 'Edit invoice INV-2048',
    body: 'Up to 720px wide. Fits two-column forms such as billing and shipping addresses.',
  },
  {
    size: 'xl',
    label: 'Extra large',
    title: 'Compare plans',
    body: 'Up to 960px wide. Fits tables and side-by-side previews in admin panels.',
  },
  {
    size: 'full',
    label: 'Full screen',
    title: 'Import transactions',
    body: 'Covers the viewport with a top app bar. Use it for multi-step work such as a CSV import.',
  },
];

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sizes.map(({ size, label, title, body }) => (
        <DialogTrigger key={size}>
          <Button variant="tonal">{label}</Button>
          <Dialog size={size}>
            <DialogHeader title={title} />
            <DialogBody>{body}</DialogBody>
            <DialogFooter>
              <Button slot="close">Done</Button>
            </DialogFooter>
          </Dialog>
        </DialogTrigger>
      ))}
    </div>
  );
}
