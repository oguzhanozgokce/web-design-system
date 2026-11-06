import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaDemo() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Message"
      description="Everyone in the conversation can read it."
      placeholder="Write a message"
    />
  );
}
