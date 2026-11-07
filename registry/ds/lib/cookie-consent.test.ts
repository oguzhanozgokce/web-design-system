import { resolveCookieConsent } from '@/registry/ds/lib/cookie-consent';

const categories = [
  { id: 'essential', isRequired: true },
  { id: 'analytics' },
  { id: 'marketing' },
];

it('keeps required categories on and grants optional categories only for the chosen action', () => {
  const value = { essential: false, analytics: true, marketing: false, removed: true };
  expect(resolveCookieConsent(categories, value)).toEqual({
    essential: true,
    analytics: true,
    marketing: false,
  });
  expect(resolveCookieConsent(categories, value, 'accept-all')).toEqual({
    essential: true,
    analytics: true,
    marketing: true,
  });
  expect(resolveCookieConsent(categories, value, 'reject-all')).toEqual({
    essential: true,
    analytics: false,
    marketing: false,
  });
  expect(value.essential).toBe(false);
});

it('does not turn inherited or non-boolean stored values into optional consent', () => {
  const value = Object.assign(Object.create({ analytics: true }), { marketing: 'true' });
  expect(resolveCookieConsent(categories, value)).toEqual({
    essential: true,
    analytics: false,
    marketing: false,
  });
  expect(resolveCookieConsent([{ id: '__proto__' }], {})).toEqual(
    JSON.parse('{"__proto__":false}'),
  );
});
