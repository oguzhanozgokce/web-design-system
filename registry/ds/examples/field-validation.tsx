'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { TextField } from '@/registry/ds/ui/text-field';

const takenUsernames = ['admin', 'support', 'alex'];

export default function FieldValidation() {
  const [created, setCreated] = useState<string | null>(null);

  return (
    <Form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setCreated(String(data.get('username')));
      }}
    >
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        isRequired
        description="We send a confirmation link here."
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Enter your email address.'
            : 'Enter an address like name@example.com.'
        }
      />
      <TextField
        name="username"
        label="Username"
        startAdornment="@"
        autoComplete="username"
        isRequired
        validate={(value) =>
          takenUsernames.includes(value.trim().toLowerCase()) ? `@${value} is already taken.` : null
        }
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Choose a username.'
            : validation.validationErrors.join(' ')
        }
      />
      <Button type="submit" className="justify-self-start">
        Create account
      </Button>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {created ? `Account @${created} created.` : null}
      </p>
    </Form>
  );
}
