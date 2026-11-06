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
    <table className="w-full max-w-md text-start text-body-md">
      <thead className="text-label-lg text-on-surface-variant">
        <tr className="border-b border-outline-variant">
          <th className="w-12 py-3 ps-3 text-start">
            <Checkbox
              aria-label="Select all files"
              isSelected={allSelected}
              isIndeterminate={selected.length > 0 && !allSelected}
              onChange={(isSelected) =>
                setSelected(isSelected ? files.map((file) => file.name) : [])
              }
            />
          </th>
          <th className="py-3 pe-3 text-start font-medium">Name</th>
          <th className="py-3 pe-3 text-start font-medium">Type</th>
          <th className="py-3 pe-3 text-end font-medium">Size</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.name} className="border-b border-outline-variant last:border-0">
            <td className="py-3 ps-3">
              <Checkbox
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
            <td className="py-3 pe-3">{file.name}</td>
            <td className="py-3 pe-3">{file.type}</td>
            <td className="py-3 pe-3 text-end whitespace-nowrap tabular-digits">
              {megabytes.format(file.size)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
