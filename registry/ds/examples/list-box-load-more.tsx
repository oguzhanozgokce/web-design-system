'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

interface Photo {
  id: number;
  megabytes: number;
}

function page(start: number): Photo[] {
  return Array.from({ length: 12 }, (_, index) => {
    const id = start + index + 1;
    return { id, megabytes: 1.2 + ((id * 7) % 30) / 10 };
  });
}

const total = 60;

export default function ListBoxLoadMore() {
  const { locale } = useLocale();
  const [items, setItems] = useState(() => page(0));
  const [isLoading, setLoading] = useState(false);
  const size = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  });

  function loadMore() {
    if (isLoading || items.length >= total) return;
    setLoading(true);
    setTimeout(() => {
      setItems((current) => [...current, ...page(current.length)]);
      setLoading(false);
    }, 900);
  }

  return (
    <ListBox
      aria-label="Photos"
      items={items}
      isLoading={isLoading}
      onLoadMore={loadMore}
      variant="outlined"
      className="h-72 w-full max-w-xs"
    >
      {(photo) => (
        <ListBoxItem description={size.format(photo.megabytes)}>
          {`IMG_${String(photo.id).padStart(4, '0')}.jpg`}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
