'use client';

import { useState } from 'react';
import { LockIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { PasswordField } from '@/registry/ds/ui/password-field';
import { TextField } from '@/registry/ds/ui/text-field';

export default function PasswordFieldSignIn() {
  const [status, setStatus] = useState('');

  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const email = new FormData(event.currentTarget).get('email');
        setStatus(`Signed in as ${email}.`);
      }}
    >
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        startAdornment={<MailIcon />}
        isRequired
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Enter your email.'
            : 'Enter an address like name@example.com.'
        }
      />
      <PasswordField
        label="Password"
        name="password"
        startAdornment={<LockIcon />}
        isRequired
        errorMessage="Enter your password."
      />
      <Button type="submit">Sign in</Button>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
