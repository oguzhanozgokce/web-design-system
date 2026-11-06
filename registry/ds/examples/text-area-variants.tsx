import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextArea label="Feedback" isRequired placeholder="What could we do better?" minRows={2} />
      <TextArea
        label="Feedback"
        variant="filled"
        isRequired
        placeholder="What could we do better?"
        minRows={2}
      />
      <TextArea
        label="Comment"
        isReadOnly
        minRows={2}
        defaultValue="Looks good to me. Ready to publish on Monday."
      />
      <TextArea
        label="Steps to reproduce"
        isInvalid
        errorMessage="Add at least one step."
        minRows={2}
      />
    </div>
  );
}
