'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { PasswordField } from '@/registry/ds/ui/password-field';

export default function PasswordFieldConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus('Password updated. Other sessions were signed out.');
      }}
    >
      <PasswordField
        label="Current password"
        name="current-password"
        isRequired
        errorMessage="Enter your current password."
      />
      <PasswordField
        label="New password"
        name="new-password"
        autoComplete="new-password"
        minLength={12}
        description="At least 12 characters."
        value={newPassword}
        onChange={setNewPassword}
        isRequired
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Enter a new password.'
            : 'Use at least 12 characters.'
        }
      />
      <PasswordField
        label="Confirm new password"
        name="confirm-password"
        autoComplete="new-password"
        isRequired
        validate={(value) =>
          value && value !== newPassword ? 'The passwords do not match.' : null
        }
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Enter the new password again.'
            : validation.validationErrors.join(' ')
        }
      />
      <Button type="submit">Update password</Button>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
