'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const styles = [
  { id: 'bold', label: 'Bold', className: 'font-bold' },
  { id: 'italic', label: 'Italic', className: 'italic' },
  { id: 'underline', label: 'Underline', className: 'underline' },
];

export default function ToggleButtonGroupMultiple() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(['bold']));
  const preview = styles
    .filter((style) => selected.has(style.id))
    .map((style) => style.className)
    .join(' ');

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButtonGroup
        aria-label="Text style"
        selectionMode="multiple"
        variant="detached"
        buttonVariant="ghost"
        size="sm"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        className="justify-center"
      >
        {styles.map((style) => (
          <ToggleButton key={style.id} id={style.id}>
            {style.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p className={`text-base text-on-surface ${preview}`}>Preview text</p>
    </div>
  );
}
