import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  type DialogSize,
} from '@/registry/ds/ui/dialog';

const sizes: { size: DialogSize; label: string; body: string }[] = [
  { size: 'sm', label: 'Small', body: 'Up to 384px wide. Fits one field or a short question.' },
  { size: 'md', label: 'Medium', body: 'Up to 448px wide, the default. Fits short forms.' },
  { size: 'lg', label: 'Large', body: 'Up to 512px wide. Fits a form with a few more fields.' },
  {
    size: 'xl',
    label: 'Extra large',
    body: 'Up to 672px wide. Fits tables and side-by-side previews.',
  },
  {
    size: 'full',
    label: 'Full screen',
    body: 'Covers the viewport with a top bar. Use it for work with several steps.',
  },
];

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sizes.map(({ size, label, body }) => (
        <DialogTrigger key={size}>
          <Button variant="soft">{label}</Button>
          <Dialog size={size}>
            <DialogHeader title={`${label} dialog`} />
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
