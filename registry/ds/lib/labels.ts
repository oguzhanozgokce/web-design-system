export type LabelValues = Record<string, string>;

export type LabelTemplate<Values extends LabelValues = LabelValues> =
  string | ((values: Values) => string);

export type LabelOverrides = Record<string, Partial<Record<string, unknown>> | undefined>;

export type LabelTemplateValues<Template> = Template extends (values: infer Values) => string
  ? Values
  : LabelValues;

export function formatLabel<Values extends LabelValues>(
  template: LabelTemplate<Values>,
  values: Values,
): string {
  if (typeof template === 'function') return template(values);
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key] : match,
  );
}

export function mergeLabels<T extends object>(
  defaults: T,
  ...overrides: (Partial<T> | undefined)[]
): T {
  const merged = { ...defaults };
  for (const override of overrides) {
    if (!override) continue;
    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}
