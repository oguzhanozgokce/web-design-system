'use client';

import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxInvalid() {
  const [methods, setMethods] = useState<string[]>([]);

  return (
    <CheckboxGroup
      label="Contact methods"
      isRequired
      value={methods}
      onChange={setMethods}
      isInvalid={methods.length === 0}
      errorMessage="Choose at least one way to reach you."
      className="max-w-sm"
    >
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="phone">Phone</Checkbox>
      <Checkbox value="sms">Text message</Checkbox>
    </CheckboxGroup>
  );
}
