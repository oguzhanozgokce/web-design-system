import { TextArea } from '@/registry/ds/ui/text-area';

export default function TextAreaVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <TextArea label="Refund reason" isRequired placeholder="What went wrong?" minRows={2} />
      <TextArea
        label="Refund reason"
        variant="filled"
        isRequired
        placeholder="What went wrong?"
        minRows={2}
      />
      <TextArea
        label="Audit trail"
        isReadOnly
        minRows={2}
        defaultValue="Approved by Dana Kim on 4 November."
      />
      <TextArea
        label="Dispute details"
        isInvalid
        errorMessage="Add at least one sentence for the bank."
        minRows={2}
      />
    </div>
  );
}
