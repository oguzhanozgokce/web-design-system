export const dsLocales = [
  'en',
  'tr',
  'de',
  'fr',
  'es',
  'pt',
  'it',
  'ru',
  'nl',
  'pl',
  'id',
  'zh',
  'ja',
  'vi',
  'th',
  'uk',
  'sw',
  'ar',
] as const;

export type DSLocale = (typeof dsLocales)[number];

export type MessageCatalog<Keys extends string> = Record<DSLocale, Record<Keys, string>>;

export interface MessageDefinition<Keys extends string> {
  namespace: string;
  catalog: MessageCatalog<Keys>;
}

export function defineMessages<Keys extends string>(
  namespace: string,
  catalog: MessageCatalog<Keys>,
): MessageDefinition<Keys> {
  return { namespace, catalog };
}

export function resolveLocale(locale: string | undefined): DSLocale {
  const language = (locale ?? 'en').toLowerCase().split(/[-_]/)[0];
  return (dsLocales as readonly string[]).includes(language) ? (language as DSLocale) : 'en';
}

export function formatMessage(template: string, values: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const rtlLanguages = new Set(['ar', 'he', 'fa', 'ur']);

export function localeDirection(locale: string | undefined): 'ltr' | 'rtl' {
  const language = (locale ?? 'en').toLowerCase().split(/[-_]/)[0];
  return rtlLanguages.has(language) ? 'rtl' : 'ltr';
}
