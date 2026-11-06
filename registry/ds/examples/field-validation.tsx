'use client';

import { useState } from 'react';
import { Form } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { TextField } from '@/registry/ds/ui/text-field';

const takenSlugs = ['acme', 'northwind', 'globex'];

export default function FieldValidation() {
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <Form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(String(data.get('slug')));
      }}
    >
      <TextField
        name="email"
        label="Billing email"
        type="email"
        autoComplete="email"
        isRequired
        description="Invoices are sent here."
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Enter the address that should receive invoices.'
            : 'Enter an address like finance@company.com.'
        }
      />
      <TextField
        name="slug"
        label="Workspace URL"
        startAdornment="ledger.app/"
        isRequired
        validate={(value) =>
          takenSlugs.includes(value.trim().toLowerCase()) ? `${value} is already taken.` : null
        }
        errorMessage={(validation) =>
          validation.validationDetails.valueMissing
            ? 'Choose the address your team will use.'
            : validation.validationErrors.join(' ')
        }
      />
      <Button type="submit" className="justify-self-start">
        Create workspace
      </Button>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {saved ? `Workspace ledger.app/${saved} created.` : null}
      </p>
    </Form>
  );
}
