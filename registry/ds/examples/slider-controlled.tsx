'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Slider } from '@/registry/ds/ui/slider';

const defaultSize = 16;

export default function SliderControlled() {
  const [size, setSize] = useState(defaultSize);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Slider
        label="Text size"
        value={size}
        onChange={setSize}
        minValue={12}
        maxValue={32}
        step={2}
      />
      <p className="min-h-12 text-on-surface" style={{ fontSize: `${size}px`, lineHeight: 1.4 }}>
        The quick brown fox
      </p>
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setSize(defaultSize)}
        isDisabled={size === defaultSize}
        className="self-end"
      >
        Reset
      </Button>
    </div>
  );
}
