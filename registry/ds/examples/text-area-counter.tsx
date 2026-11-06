import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaCounter() {
  return (
    <TextArea
      className="w-full max-w-md"
      label="Short bio"
      description="Appears on your public profile."
      defaultValue="Photographer and amateur cook. I post about travel, film cameras and bread."
      maxLength={160}
      minRows={2}
    />
  );
}
