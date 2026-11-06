'use client';

import { useState } from 'react';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';

export default function RadioGroupInvalid() {
  const [source, setSource] = useState<string | null>(null);

  return (
    <RadioGroup
      label="How did you hear about us?"
      isRequired
      value={source}
      onChange={setSource}
      isInvalid={source === null}
      errorMessage="Choose an option to continue."
      className="max-w-md"
    >
      <Radio value="search">Search engine</Radio>
      <Radio value="social">Social media</Radio>
      <Radio value="friend">A friend</Radio>
    </RadioGroup>
  );
}
