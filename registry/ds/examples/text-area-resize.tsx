import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaResize() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Meeting notes"
      resize="vertical"
      maxRows={20}
      placeholder="Decisions, owners and dates"
    />
  );
}
