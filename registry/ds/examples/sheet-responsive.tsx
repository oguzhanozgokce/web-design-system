'use client';

import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { FilterIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const types = ['Photos', 'Videos', 'Documents', 'Music'];

export default function SheetResponsive() {
  const isWide = useMediaQuery('(min-width: 48rem)');

  return (
    <SheetTrigger>
      <Button variant="outline" startIcon={<FilterIcon />}>
        Filters
      </Button>
      <Sheet side={isWide ? 'end' : 'bottom'} size="sm">
        <SheetHeader title="Filters" description="Show only the types you pick." />
        <SheetBody>
          <ChipGroup label="Type" selectionMode="multiple" defaultSelectedKeys={['photos']}>
            {types.map((type) => (
              <Chip key={type} id={type.toLowerCase()}>
                {type}
              </Chip>
            ))}
          </ChipGroup>
        </SheetBody>
        <SheetFooter>
          <Button variant="soft" slot="close">
            Cancel
          </Button>
          <Button slot="close">Apply</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
