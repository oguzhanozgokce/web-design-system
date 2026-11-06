'use client';

import { useState } from 'react';
import { PasswordField, type PasswordStrength } from '@/registry/ds/ui/password-field';

function estimate(value: string): PasswordStrength {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 14) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4) as PasswordStrength;
}

export default function PasswordFieldStrength() {
  const [strength, setStrength] = useState<PasswordStrength>(0);

  return (
    <PasswordField
      className="w-full max-w-sm"
      label="Vault passphrase"
      description="Used to unlock exported ledgers. We cannot recover it."
      strength={strength}
      onChange={(value) => setStrength(estimate(value))}
    />
  );
}
