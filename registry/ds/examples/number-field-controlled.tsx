'use client';

import { useState } from 'react';
import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldControlled() {
  const [size, setSize] = useState(16);
  const fontSize = Number.isFinite(size) ? size : 16;

  return (
    <div className="flex flex-col items-center gap-4">
      <NumberField label="Text size" value={size} onChange={setSize} minValue={12} maxValue={32} />
      <p className="text-center text-on-surface" style={{ fontSize, lineHeight: 1.25 }}>
        The quick brown fox
      </p>
    </div>
  );
}
