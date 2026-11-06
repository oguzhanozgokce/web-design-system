'use client';

import { useState } from 'react';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

const problems = ['Enter your name', 'Enter an email address in the format name@example.com'];

export default function BannerForm() {
  const [isSubmitted, setSubmitted] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface-container-low p-5">
      <div>
        <p className="text-title-md text-on-surface">Edit profile</p>
        <p className="text-body-md text-on-surface-variant">Shown to people you work with</p>
      </div>
      {isSubmitted ? (
        <Banner tone="error" announce title={`Fix ${problems.length} fields to save your profile`}>
          <ul className="mt-1 list-disc ps-5">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </Banner>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="text" onPress={() => setSubmitted(false)}>
          Reset
        </Button>
        <Button onPress={() => setSubmitted(true)}>Save</Button>
      </div>
    </div>
  );
}
