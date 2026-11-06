import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaCounter() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Short bio"
      description="Appears on your public profile."
      defaultValue="Finance lead at Northwind. I keep the shared ledgers tidy."
      maxLength={160}
      minRows={2}
    />
  );
}
