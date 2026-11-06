'use client';

import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxInvalid() {
  const [channels, setChannels] = useState<string[]>([]);

  return (
    <CheckboxGroup
      label="Payout alerts"
      isRequired
      value={channels}
      onChange={setChannels}
      isInvalid={channels.length === 0}
      errorMessage="Pick at least one channel so a failed payout never goes unnoticed."
      className="max-w-sm"
    >
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">Text message</Checkbox>
      <Checkbox value="slack">Slack</Checkbox>
    </CheckboxGroup>
  );
}
