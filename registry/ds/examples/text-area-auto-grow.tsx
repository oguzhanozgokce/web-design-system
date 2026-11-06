import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaAutoGrow() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Release notes"
      minRows={2}
      maxRows={6}
      defaultValue={
        'Dark mode now follows your system setting.\nPhotos load faster on slow connections.'
      }
      description="Grows from 2 to 6 lines, then scrolls."
    />
  );
}
