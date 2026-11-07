'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Checkbox } from '@/registry/ds/ui/checkbox';

const files = [
  { name: 'Photo.jpg', type: 'Image', size: 2.4 },
  { name: 'Notes.txt', type: 'Text', size: 0.1 },
  { name: 'Song.mp3', type: 'Audio', size: 6.8 },
];

export default function CheckboxIndeterminate() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<string[]>(['Notes.txt']);
  const megabytes = new Intl.NumberFormat(locale, { style: 'unit', unit: 'megabyte' });
  const allSelected = selected.length === files.length;

  return (
    <table className="w-full max-w-md text-start text-sm text-on-surface">
      <thead className="text-xs font-medium text-on-surface-variant">
        <tr className="border-b border-outline-subtle">
          <th className="w-11 py-2.5 ps-3 text-start">
            <Checkbox
              size="sm"
              aria-label="Select all files"
              isSelected={allSelected}
              isIndeterminate={selected.length > 0 && !allSelected}
              onChange={(isSelected) =>
                setSelected(isSelected ? files.map((file) => file.name) : [])
              }
            />
          </th>
          <th className="py-2.5 pe-3 text-start font-medium">Name</th>
          <th className="py-2.5 pe-3 text-start font-medium">Type</th>
          <th className="py-2.5 pe-3 text-end font-medium">Size</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.name} className="border-b border-outline-subtle last:border-0">
            <td className="py-2.5 ps-3">
              <Checkbox
                size="sm"
                aria-label={`Select ${file.name}`}
                isSelected={selected.includes(file.name)}
                onChange={(isSelected) =>
                  setSelected((current) =>
                    isSelected
                      ? [...current, file.name]
                      : current.filter((name) => name !== file.name),
                  )
                }
              />
            </td>
            <td className="py-2.5 pe-3">{file.name}</td>
            <td className="py-2.5 pe-3 text-on-surface-variant">{file.type}</td>
            <td className="py-2.5 pe-3 text-end whitespace-nowrap text-on-surface-variant tabular-digits">
              {megabytes.format(file.size)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
