import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaDemo() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Invoice note"
      description="Printed under the totals on every invoice."
      placeholder="Thanks for your business. Payment is due within 14 days."
    />
  );
}
