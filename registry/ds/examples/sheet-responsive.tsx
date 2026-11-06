'use client';

import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { FilterIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const statuses = ['Paid', 'Overdue', 'Draft', 'Refunded'];

export default function SheetResponsive() {
  const isWide = useMediaQuery('(min-width: 48rem)');

  return (
    <SheetTrigger>
      <Button variant="outlined" startIcon={<FilterIcon />}>
        Filter invoices
      </Button>
      <Sheet side={isWide ? 'end' : 'bottom'} size="sm">
        <SheetHeader title="Filter invoices" description="Pick one or more statuses." />
        <SheetBody>
          <ChipGroup label="Status" selectionMode="multiple" defaultSelectedKeys={['overdue']}>
            {statuses.map((status) => (
              <Chip key={status} id={status.toLowerCase()}>
                {status}
              </Chip>
            ))}
          </ChipGroup>
        </SheetBody>
        <SheetFooter>
          <Button variant="text" slot="close">
            Cancel
          </Button>
          <Button slot="close">Apply filters</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
