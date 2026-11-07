'use client';

import { useEffect, useMemo, useState } from 'react';
import { DropZone, FileTrigger, Radio, RadioGroup, Text } from 'react-aria-components';
import { useImageSeed } from '@/registry/ds/hooks/use-image-seed';
import { CheckIcon, UploadIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';
import { Spinner } from '@/registry/ds/ui/spinner';

const samples = [
  { name: 'Dune', src: '/samples/dune.jpg' },
  { name: 'Lagoon', src: '/samples/lagoon.jpg' },
  { name: 'Moss', src: '/samples/moss.jpg' },
  { name: 'Dusk', src: '/samples/dusk.jpg' },
];

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);
  return url;
}

const ring = cn(
  'focus-ring cursor-pointer outline-offset-2',
  'data-[selected]:ring-2 data-[selected]:ring-offset-2 data-[selected]:ring-offset-canvas',
);

export default function DynamicThemeImage() {
  const [sample, setSample] = useState(samples[0].src);
  const [file, setFile] = useState<File | null>(null);
  const [rejected, setRejected] = useState(false);
  const fileUrl = useObjectUrl(file);
  const source = file ?? sample;
  const { seeds, status } = useImageSeed(source);
  const [chosen, setChosen] = useState<{ source: File | string; seed: string } | null>(null);
  const seed = chosen?.source === source ? chosen.seed : (seeds[0] ?? null);

  const pick = (files: Iterable<File> | null) => {
    const image = [...(files ?? [])].find((item) => item.type.startsWith('image/'));
    setRejected(!image);
    if (image) setFile(image);
  };

  const message = rejected
    ? 'That file is not an image.'
    : status === 'loading'
      ? 'Reading colours'
      : status === 'error'
        ? 'That image could not be read.'
        : `Found ${seeds.length} ${seeds.length === 1 ? 'colour' : 'colours'}`;

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      <RadioGroup
        aria-label="Sample photo"
        orientation="horizontal"
        value={file ? '' : sample}
        onChange={(value) => {
          setFile(null);
          setRejected(false);
          setSample(value);
        }}
        className="flex flex-wrap gap-2"
      >
        {samples.map((item) => (
          <Radio
            key={item.src}
            value={item.src}
            className={cn(ring, 'overflow-hidden rounded-lg data-[selected]:ring-primary')}
          >
            <img src={item.src} alt={item.name} className="h-12 w-18 object-cover" />
          </Radio>
        ))}
      </RadioGroup>

      <div className="flex flex-col gap-2">
        <DropZone
          onDrop={async (event) => {
            const items = event.items.filter((item) => item.kind === 'file');
            pick(await Promise.all(items.map((item) => item.getFile())));
          }}
          className="flex flex-wrap items-center gap-3 rounded-container border border-dashed border-outline-variant p-3 text-on-surface-variant data-[drop-target]:border-primary data-[drop-target]:bg-primary-soft"
        >
          <FileTrigger acceptedFileTypes={['image/*']} onSelect={(files) => pick(files)}>
            <Button variant="soft" size="sm" startIcon={<UploadIcon />}>
              Choose a photo
            </Button>
          </FileTrigger>
          <Text slot="label" className="text-xs">
            Drop a photo here
          </Text>
        </DropZone>
        <p className="text-xs text-on-surface-variant">
          Photos are read in your browser and never uploaded.
        </p>
      </div>

      <div className="flex min-h-10 flex-wrap items-center gap-3">
        <p role="status" className="flex items-center gap-2 text-xs text-on-surface-variant">
          {status === 'loading' ? <Spinner /> : null}
          {message}
        </p>
        {status === 'ready' && seeds.length ? (
          <RadioGroup
            aria-label="Seed colour from the photo"
            orientation="horizontal"
            value={seed ?? ''}
            onChange={(value) => setChosen({ source, seed: value })}
            className="flex gap-2"
          >
            {seeds.map((candidate, index) => (
              <Radio
                key={candidate}
                value={candidate}
                aria-label={index === 0 ? 'Best match' : `Option ${index + 1}`}
                className={cn(
                  ring,
                  'grid size-10 place-items-center rounded-full data-[selected]:ring-on-surface',
                )}
              >
                {({ isSelected }) => (
                  <DynamicTheme
                    seed={candidate}
                    paletteStyle="fidelity"
                    contrast="standard"
                    className="grid size-8 place-items-center rounded-full bg-primary-solid text-on-primary-solid"
                  >
                    {isSelected ? <CheckIcon className="text-lg" /> : null}
                  </DynamicTheme>
                )}
              </Radio>
            ))}
          </RadioGroup>
        ) : null}
      </div>

      <DynamicTheme
        seed={seed}
        className="overflow-hidden rounded-container border border-outline-subtle bg-surface-raised text-on-surface"
      >
        <img src={fileUrl ?? sample} alt="" className="h-36 w-full object-cover" />
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-xs font-medium text-primary">Collection</p>
            <p className="text-xl font-semibold tracking-tight">Quiet hours</p>
            <p className="text-sm text-on-surface-variant">24 tracks · themed from the cover</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Play</Button>
            <Button variant="soft" tone="primary">
              Save
            </Button>
            <span className="self-center rounded-control bg-primary-soft px-3 py-1 text-xs font-medium text-on-primary-soft">
              New
            </span>
          </div>
        </div>
      </DynamicTheme>
    </div>
  );
}
