'use client';

import { useState } from 'react';
import { AvatarButton, AvatarGroup } from '@/registry/ds/ui/avatar';

const reviewers = ['Ayşe Demir', 'Mehmet Kaya', 'Elif Şahin', 'Can Yılmaz'];

export default function AvatarButtonExample() {
  const [reviewer, setReviewer] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarGroup aria-label="Suggested reviewers" size="md" max={reviewers.length}>
        {reviewers.map((name) => (
          <AvatarButton
            key={name}
            name={name}
            aria-label={`Assign ${name}`}
            onPress={() => setReviewer(name)}
          />
        ))}
      </AvatarGroup>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {reviewer ? `Reviewer: ${reviewer}` : 'Pick a reviewer for INV-2048'}
      </p>
    </div>
  );
}
