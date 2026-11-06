'use client';

import { useState } from 'react';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupInvalid() {
  const [reason, setReason] = useState<string | null>(null);

  return (
    <RadioGroup
      label="Why are you closing this account?"
      isRequired
      value={reason}
      onChange={setReason}
      isInvalid={reason === null}
      errorMessage="Choose a reason so we can route the request to the right team."
      className="max-w-md"
    >
      <Radio value="duplicate">It is a duplicate account</Radio>
      <Radio value="business-closed">The business has closed</Radio>
      <Radio value="switching">We are moving to another tool</Radio>
    </RadioGroup>
  );
}
