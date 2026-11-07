'use client';

import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

const locales = [
  { locale: 'en-US', name: 'English', dir: 'ltr' },
  { locale: 'de-DE', name: 'German', dir: 'ltr' },
  { locale: 'fr-FR', name: 'French', dir: 'ltr' },
  { locale: 'hi-IN', name: 'Hindi', dir: 'ltr' },
  { locale: 'ar-EG', name: 'Arabic', dir: 'rtl' },
] as const;

export default function RollingNumberLocales() {
  const [visits, setVisits] = useState(1234567.8);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
        {locales.map(({ locale, name, dir }) => (
          <div key={locale} className="contents">
            <dt className="text-on-surface-variant">{name}</dt>
            <dd lang={locale} dir={dir} className="text-end font-medium text-on-surface">
              <I18nProvider locale={locale}>
                <RollingNumber value={visits} formatOptions={{ maximumFractionDigits: 1 }} />
              </I18nProvider>
            </dd>
          </div>
        ))}
      </dl>
      <Button
        variant="soft"
        size="sm"
        className="self-start"
        onPress={() => setVisits((current) => current + 1111.1)}
      >
        Add 1,111.1
      </Button>
    </div>
  );
}
