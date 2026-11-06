import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const widths = {
  sm: '320px, for a short list or a single setting.',
  md: '400px, the Material 3 side sheet width and the default.',
  lg: '560px, for a form with two columns or a detail view.',
  xl: '720px, for a preview next to its metadata.',
  full: 'the whole screen, for an editor that needs every pixel.',
} as const;

export default function SheetSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(Object.keys(widths) as (keyof typeof widths)[]).map((size) => (
        <SheetTrigger key={size}>
          <Button variant="outlined">Size {size}</Button>
          <Sheet size={size}>
            <SheetHeader title="Activity" description={`Size ${size}`} />
            <SheetBody>
              <p className="text-on-surface-variant">This sheet is {widths[size]}</p>
            </SheetBody>
          </Sheet>
        </SheetTrigger>
      ))}
    </div>
  );
}
