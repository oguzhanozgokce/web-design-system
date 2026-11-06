'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import {
  Sheet,
  SheetBody,
  SheetHeader,
  SheetTrigger,
  type SheetSnapPoint,
} from '@/registry/ds/ui/sheet';

const notifications = [
  'Alex Morgan commented on your photo',
  'Sam Lee shared a folder with you',
  'Your backup finished',
  'Priya Shah mentioned you in a comment',
  'New sign-in on another device',
  'Jonas Weber replied to your comment',
  'Your storage is almost full',
  'Mei Tanaka invited you to a group',
  'Your password was changed',
  'Chris Taylor shared 3 photos with you',
  'Your weekly summary is ready',
  'Lena Fischer accepted your invitation',
];

export default function SheetSnapPoints() {
  const { locale } = useLocale();
  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('50%');
  const time = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  return (
    <div className="flex flex-col items-center gap-3">
      <SheetTrigger>
        <Button variant="tonal">Notifications</Button>
        <Sheet
          side="bottom"
          snapPoints={['50%', '90%']}
          snapPoint={snapPoint}
          onSnapPointChange={setSnapPoint}
        >
          <SheetHeader title="Notifications" description={`${notifications.length} new`} />
          <SheetBody>
            <ul className="flex flex-col divide-y divide-outline-variant">
              {notifications.map((text, index) => (
                <li key={text} className="flex flex-col py-3">
                  <p className="text-body-lg text-on-surface">{text}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {time.format(-(index + 1), 'hour')}
                  </p>
                </li>
              ))}
            </ul>
          </SheetBody>
        </Sheet>
      </SheetTrigger>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Opens at {snapPoint} of the screen
      </p>
    </div>
  );
}
