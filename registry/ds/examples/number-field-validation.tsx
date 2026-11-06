'use client';

import { useState } from 'react';
import { Form, useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldValidation() {
  const { locale } = useLocale();
  const [saved, setSaved] = useState<string | null>(null);
  const integer = new Intl.NumberFormat(locale);

  return (
    <Form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const rows = integer.format(Number(data.get('rows')));
        const days = integer.format(Number(data.get('retention')));
        setSaved(`Saved. Files hold ${rows} rows and are kept ${days} days.`);
      }}
    >
      <NumberField
        name="rows"
        label="Rows per file"
        layout="inline"
        defaultValue={5000}
        minValue={500}
        maxValue={50000}
        step={500}
        commitBehavior="validate"
        description="In steps of 500, up to 50,000."
        errorMessage={(validation) => {
          if (validation.validationDetails.stepMismatch) return 'Use a multiple of 500.';
          if (validation.validationDetails.rangeOverflow) return 'Use 50,000 rows or fewer.';
          if (validation.validationDetails.rangeUnderflow) return 'Use at least 500 rows.';
          return validation.validationErrors.join(' ');
        }}
      />
      <NumberField
        name="retention"
        label="Keep exports for"
        layout="inline"
        minValue={1}
        maxValue={90}
        isRequired
        formatOptions={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
        errorMessage="Choose how many days to keep exports, from 1 to 90."
      />
      <Button type="submit" className="justify-self-start">
        Save export settings
      </Button>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {saved}
      </p>
    </Form>
  );
}
