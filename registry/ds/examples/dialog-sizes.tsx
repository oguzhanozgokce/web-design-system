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
  {
    size: 'md',
    label: 'Medium',
    body: 'Up to 560px wide, the Material 3 maximum for a basic dialog. Fits short forms.',
  },
  { size: 'lg', label: 'Large', body: 'Up to 720px wide. Fits forms with two columns.' },
  {
    size: 'xl',
    label: 'Extra large',
    body: 'Up to 960px wide. Fits tables and side-by-side previews.',
  },
  {
    size: 'full',
    label: 'Full screen',
    body: 'Covers the viewport with a top app bar. Use it for work with several steps.',
  },
];

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sizes.map(({ size, label, body }) => (
        <DialogTrigger key={size}>
          <Button variant="tonal">{label}</Button>
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
