'use client';

import { startTransition, useState } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';
import { CheckIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/registry/ds/ui/card';
import { DynamicTheme, useThemeTransition } from '@/registry/ds/ui/dynamic-theme';
import { Switch } from '@/registry/ds/ui/switch';

const presets = [
  { name: 'Indigo', seed: '#5b4bff' },
  { name: 'Teal', seed: '#0b8f6a' },
  { name: 'Coral', seed: '#e8613c' },
  { name: 'Amber', seed: '#c98a00' },
  { name: 'Rose', seed: '#c2185b' },
];

export default function DynamicThemeDemo() {
  const [seed, setSeed] = useState(presets[1].seed);
  const [custom, setCustom] = useState(presets[1].seed);
  const [wholePage, setWholePage] = useState(false);
  const transition = useThemeTransition();
  const isPreset = presets.some((preset) => preset.seed === seed);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <RadioGroup
          aria-label="Brand colour"
          orientation="horizontal"
          value={isPreset ? seed : ''}
          onChange={(value) =>
            transition(() => {
              setSeed(value);
              setCustom(value);
            })
          }
          className="flex gap-2"
        >
          {presets.map((preset) => (
            <Radio
              key={preset.seed}
              value={preset.seed}
              aria-label={preset.name}
              className={cn(
                'grid size-10 cursor-pointer place-items-center rounded-full focus-ring outline-offset-2',
                'data-[selected]:ring-2 data-[selected]:ring-on-surface',
                'data-[selected]:ring-offset-2 data-[selected]:ring-offset-canvas',
              )}
            >
              {({ isSelected }) => (
                <DynamicTheme
                  seed={preset.seed}
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
        <label className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
          <input
            type="color"
            value={custom}
            onChange={(event) => {
              const value = event.target.value;
              setCustom(value);
              startTransition(() => setSeed(value));
            }}
            className="size-10 cursor-pointer rounded-full border border-outline-variant bg-surface-raised p-1 focus-ring"
          />
          Custom colour
        </label>
      </div>

      <Switch isSelected={wholePage} onChange={(value) => transition(() => setWholePage(value))}>
        Apply to the whole page
      </Switch>

      {wholePage ? <DynamicTheme scope="root" seed={seed} paletteStyle="vibrant" /> : null}

      <DynamicTheme seed={seed} paletteStyle="vibrant">
        <Card>
          <CardHeader title="Design team" description="Your accent colour, every role" />
          <CardContent className="flex flex-wrap gap-2">
            <span className="rounded-control bg-primary-solid px-3 py-1 text-sm font-medium text-on-primary-solid">
              solid
            </span>
            <span className="rounded-control bg-primary-soft px-3 py-1 text-sm font-medium text-on-primary-soft">
              soft
            </span>
            <span className="rounded-control border border-outline-variant px-3 py-1 text-sm font-medium text-primary">
              text
            </span>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Invite</Button>
            <Button>Open</Button>
          </CardFooter>
        </Card>
      </DynamicTheme>
    </div>
  );
}
