import type { ReactNode } from 'react';

export interface CookieConsentCategory {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  isRequired?: boolean;
}

export type CookieConsentValue = Readonly<Record<string, boolean>>;

export type CookieConsentAction = 'accept-all' | 'reject-all' | 'save-preferences';

export interface CookieConsentDecision {
  action: CookieConsentAction;
  value: CookieConsentValue;
}

export function resolveCookieConsent(
  categories: readonly Pick<CookieConsentCategory, 'id' | 'isRequired'>[],
  value: CookieConsentValue,
  action: CookieConsentAction = 'save-preferences',
): CookieConsentValue {
  return Object.fromEntries(
    categories.map(({ id, isRequired }) => [
      id,
      isRequired === true ||
        action === 'accept-all' ||
        (action === 'save-preferences' && Object.hasOwn(value, id) && value[id] === true),
    ]),
  );
}
