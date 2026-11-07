export interface OdometerDigit {
  kind: 'digit';
  key: string;
  place: number;
  digit: number;
  count: number;
}

export interface OdometerSeparator {
  kind: 'separator';
  key: string;
  value: string;
}

export type OdometerCoreItem = OdometerDigit | OdometerSeparator;

export interface OdometerText {
  kind: 'text';
  key: string;
  value: string;
}

export interface OdometerSign {
  kind: 'sign';
  key: string;
  value: string;
}

export type OdometerAffix = OdometerText | OdometerSign;

export interface OdometerLayout {
  formatted: string;
  before: OdometerAffix[];
  core: OdometerCoreItem[];
  after: OdometerAffix[];
  glyphs: string[];
}

const coreTypes = new Set<string>(['integer', 'group', 'decimal', 'fraction']);
const signTypes = new Set<string>(['minusSign', 'plusSign']);
const bidiMarks = /[‎‏؜]/;
const countDigits = 15;

export function odometerGlyphs(locale: string, numberingSystem: string) {
  const formatter = new Intl.NumberFormat(locale, { numberingSystem, useGrouping: false });
  return Array.from({ length: 10 }, (_, digit) => formatter.format(digit));
}

function digitsOf(value: string, glyphs: string[]) {
  return Array.from(value).map((character) => {
    const index = glyphs.indexOf(character);
    if (index >= 0) return index;
    return /^[0-9]$/.test(character) ? Number(character) : -1;
  });
}

function affixesOf(parts: Intl.NumberFormatPart[]) {
  const seen = new Map<string, number>();
  return parts.map<OdometerAffix>((part) => {
    const occurrence = seen.get(part.type) ?? 0;
    seen.set(part.type, occurrence + 1);
    const key = `${part.type}-${occurrence}`;
    if (signTypes.has(part.type) && !bidiMarks.test(part.value)) {
      return { kind: 'sign', key: 'sign', value: part.value };
    }
    return { kind: 'text', key, value: part.value };
  });
}

function textLayout(formatted: string, glyphs: string[]): OdometerLayout {
  return {
    formatted,
    before: [{ kind: 'text', key: 'text-0', value: formatted }],
    core: [],
    after: [],
    glyphs,
  };
}

export function odometerLayout(value: number, formatter: Intl.NumberFormat, glyphs: string[]) {
  const parts = formatter.formatToParts(value);
  const formatted = parts.map((part) => part.value).join('');
  const start = parts.findIndex((part) => coreTypes.has(part.type));
  if (start < 0) return textLayout(formatted, glyphs);
  let end = start;
  while (end + 1 < parts.length && coreTypes.has(parts[end + 1].type)) end++;
  const coreParts = parts.slice(start, end + 1);

  const integerLength = coreParts
    .filter((part) => part.type === 'integer')
    .reduce((length, part) => length + Array.from(part.value).length, 0);
  const all: number[] = [];
  const core: OdometerCoreItem[] = [];
  let place = integerLength - 1;

  for (const part of coreParts) {
    if (part.type === 'integer' || part.type === 'fraction') {
      for (const digit of digitsOf(part.value, glyphs)) {
        if (digit < 0) return textLayout(formatted, glyphs);
        all.push(digit);
        const prefix = all.slice(Math.max(0, all.length - countDigits));
        core.push({
          kind: 'digit',
          key: `digit${place}`,
          place,
          digit,
          count: Number(prefix.join('')),
        });
        place--;
      }
    } else {
      core.push({
        kind: 'separator',
        key: part.type === 'decimal' ? 'decimal' : `group${place}`,
        value: part.value,
      });
    }
  }

  return {
    formatted,
    before: affixesOf(parts.slice(0, start)),
    core,
    after: affixesOf(parts.slice(end + 1)),
    glyphs,
  } satisfies OdometerLayout;
}

export function odometerCounts(layout: OdometerLayout) {
  const counts = new Map<number, number>();
  for (const item of layout.core) if (item.kind === 'digit') counts.set(item.place, item.count);
  return counts;
}

export function firstChangedPlace(previous: Map<number, number>, next: Map<number, number>) {
  let lowest: number | undefined;
  for (const [place, count] of next) {
    if (previous.get(place) === count) continue;
    if (lowest === undefined || place < lowest) lowest = place;
  }
  for (const place of previous.keys()) {
    if (next.has(place)) continue;
    if (lowest === undefined || place < lowest) lowest = place;
  }
  return lowest;
}

export function odometerOffset(position: number) {
  return ((position % 10) + 10) % 10;
}

export function odometerStart(count: number) {
  return Math.floor(count / 10) * 10;
}

export interface OdometerSpring {
  stiffness: number;
  damping: number;
  mass?: number;
}

const overshootLimit = 0.3;

export function odometerSpring<Spring extends OdometerSpring>(spring: Spring, travel: number) {
  const distance = Math.abs(travel);
  if (distance <= overshootLimit) return spring;
  const critical = 2 * Math.sqrt(spring.stiffness * (spring.mass ?? 1));
  const logLimit = Math.log(overshootLimit / distance);
  const ratio = -logLimit / Math.sqrt(Math.PI ** 2 + logLimit ** 2);
  return spring.damping >= ratio * critical ? spring : { ...spring, damping: ratio * critical };
}
