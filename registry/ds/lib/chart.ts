export type ChartDomain = readonly [number, number];

export interface ChartTicks {
  domain: [number, number];
  ticks: number[];
  step: number;
}

export interface LinearScale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
  invert: (position: number) => number;
}

export interface BandScale {
  count: number;
  step: number;
  bandwidth: number;
  start: (index: number) => number;
  center: (index: number) => number;
  indexAt: (position: number) => number;
}

export interface ChartPosition {
  x: number;
  y: number;
}

export type ChartCurve = 'linear' | 'monotone' | 'step';

export interface StackSegment {
  start: number;
  end: number;
}

export interface StackLayout {
  segments: (StackSegment | null)[][];
  positiveTotals: number[];
  negativeTotals: number[];
  min: number;
  max: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function extent(values: Iterable<number | null | undefined>): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!isFiniteNumber(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return min === Infinity ? null : [min, max];
}

function tickIncrement(start: number, stop: number, count: number) {
  const raw = (stop - start) / Math.max(1, count);
  const power = Math.floor(Math.log10(raw));
  const error = raw / 10 ** power;
  const factor =
    error >= Math.sqrt(50) ? 10 : error >= Math.sqrt(10) ? 5 : error >= Math.sqrt(2) ? 2 : 1;
  return factor * 10 ** power;
}

function roundToStep(value: number, step: number) {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(Math.min(20, decimals)));
}

export function niceTicks(min: number, max: number, count = 4): ChartTicks {
  let low = Math.min(min, max);
  let high = Math.max(min, max);
  if (low === high) {
    if (low === 0) high = 1;
    else if (low > 0) low = 0;
    else high = 0;
  }
  let step = tickIncrement(low, high, count);
  for (let pass = 0; pass < 2; pass++) {
    low = Math.floor(low / step) * step;
    high = Math.ceil(high / step) * step;
    step = tickIncrement(low, high, count);
  }
  low = Math.floor(low / step) * step;
  high = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  const total = Math.round((high - low) / step);
  for (let index = 0; index <= total; index++) ticks.push(roundToStep(low + index * step, step));
  return { domain: [roundToStep(low, step), roundToStep(high, step)], ticks, step };
}

export function linearScale(domain: ChartDomain, range: ChartDomain = [0, 1]): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const scale = ((value: number) => r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;
  scale.domain = [d0, d1];
  scale.range = [r0, r1];
  scale.invert = (position: number) => d0 + ((position - r0) / (r1 - r0 || 1)) * span;
  return scale;
}

export function bandScale(count: number, { padding = 0 }: { padding?: number } = {}): BandScale {
  const safeCount = Math.max(1, count);
  const step = 1 / safeCount;
  const bandwidth = step * (1 - clamp(padding, 0, 0.95));
  const offset = (step - bandwidth) / 2;
  return {
    count: safeCount,
    step,
    bandwidth,
    start: (index) => index * step + offset,
    center: (index) => index * step + step / 2,
    indexAt: (position) => clamp(Math.floor(position * safeCount), 0, safeCount - 1),
  };
}

export function pointScale(count: number) {
  const last = Math.max(1, count - 1);
  return {
    position: (index: number) => (count <= 1 ? 0.5 : index / last),
    indexAt: (position: number) =>
      count <= 1 ? 0 : clamp(Math.round(position * last), 0, count - 1),
  };
}

export function stack(rows: readonly (readonly (number | null | undefined)[])[]): StackLayout {
  const seriesCount = rows.length;
  const categoryCount = Math.max(0, ...rows.map((row) => row.length));
  const segments: (StackSegment | null)[][] = rows.map(() => new Array(categoryCount).fill(null));
  const positiveTotals = new Array<number>(categoryCount).fill(0);
  const negativeTotals = new Array<number>(categoryCount).fill(0);
  for (let category = 0; category < categoryCount; category++) {
    let up = 0;
    let down = 0;
    for (let series = 0; series < seriesCount; series++) {
      const value = rows[series][category];
      if (!isFiniteNumber(value) || value === 0) continue;
      if (value > 0) {
        segments[series][category] = { start: up, end: up + value };
        up += value;
      } else {
        segments[series][category] = { start: down, end: down + value };
        down += value;
      }
    }
    positiveTotals[category] = up;
    negativeTotals[category] = down;
  }
  return {
    segments,
    positiveTotals,
    negativeTotals,
    min: Math.min(0, ...negativeTotals),
    max: Math.max(0, ...positiveTotals),
  };
}

export function normalizeRows(rows: readonly (readonly (number | null | undefined)[])[]) {
  const categoryCount = Math.max(0, ...rows.map((row) => row.length));
  const totals = new Array<number>(categoryCount).fill(0);
  for (const row of rows) {
    row.forEach((value, category) => {
      if (isFiniteNumber(value)) totals[category] += Math.abs(value);
    });
  }
  return rows.map((row) =>
    row.map((value, category) =>
      isFiniteNumber(value) && totals[category] > 0 ? value / totals[category] : null,
    ),
  );
}

function sign(value: number) {
  return value < 0 ? -1 : 1;
}

function interiorTangent(previous: ChartPosition, point: ChartPosition, next: ChartPosition) {
  const h0 = point.x - previous.x;
  const h1 = next.x - point.x;
  const s0 = (point.y - previous.y) / (h0 || 1);
  const s1 = (next.y - point.y) / (h1 || 1);
  const p = (s0 * h1 + s1 * h0) / (h0 + h1 || 1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

function endTangent(point: ChartPosition, neighbour: ChartPosition, tangent: number) {
  const h = neighbour.x - point.x;
  return h ? (3 * (neighbour.y - point.y)) / h / 2 - tangent / 2 : tangent;
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, '');
}

function move({ x, y }: ChartPosition) {
  return `M${format(x)},${format(y)}`;
}

function linearSegment(points: ChartPosition[]) {
  return points
    .slice(1)
    .map(({ x, y }) => `L${format(x)},${format(y)}`)
    .join('');
}

function stepSegment(points: ChartPosition[]) {
  let path = '';
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const point = points[index];
    const middle = (previous.x + point.x) / 2;
    path += `H${format(middle)}V${format(point.y)}H${format(point.x)}`;
  }
  return path;
}

function monotoneSegment(points: ChartPosition[]) {
  if (points.length < 3) return linearSegment(points);
  const tangents = points.map((point, index) =>
    index === 0 || index === points.length - 1
      ? 0
      : interiorTangent(points[index - 1], point, points[index + 1]),
  );
  tangents[0] = endTangent(points[0], points[1], tangents[1]);
  const last = points.length - 1;
  tangents[last] = endTangent(points[last], points[last - 1], tangents[last - 1]);
  let path = '';
  for (let index = 0; index < last; index++) {
    const a = points[index];
    const b = points[index + 1];
    const third = (b.x - a.x) / 3;
    path += `C${format(a.x + third)},${format(a.y + tangents[index] * third)},${format(
      b.x - third,
    )},${format(b.y - tangents[index + 1] * third)},${format(b.x)},${format(b.y)}`;
  }
  return path;
}

function curveSegment(points: ChartPosition[], curve: ChartCurve) {
  if (curve === 'monotone') return monotoneSegment(points);
  if (curve === 'step') return stepSegment(points);
  return linearSegment(points);
}

export function splitDefined<T>(
  values: readonly (T | null | undefined)[],
  isDefined: (value: T | null | undefined) => boolean = (value) => value != null,
) {
  const runs: { start: number; values: T[] }[] = [];
  let current: { start: number; values: T[] } | null = null;
  values.forEach((value, index) => {
    if (isDefined(value)) {
      if (!current) {
        current = { start: index, values: [] };
        runs.push(current);
      }
      current.values.push(value as T);
    } else {
      current = null;
    }
  });
  return runs;
}

export function linePath(
  points: readonly (ChartPosition | null)[],
  curve: ChartCurve = 'monotone',
): string {
  return splitDefined(points)
    .map(({ values }) => move(values[0]) + curveSegment(values, curve))
    .join('');
}

function reversePath(points: ChartPosition[], curve: ChartCurve) {
  return curveSegment([...points].reverse(), curve);
}

export function areaPath(
  top: readonly (ChartPosition | null)[],
  bottom: readonly (ChartPosition | null)[],
  curve: ChartCurve = 'monotone',
): string {
  const pairs = top.map((point, index) =>
    point && bottom[index] ? { top: point, bottom: bottom[index] as ChartPosition } : null,
  );
  return splitDefined(pairs)
    .map(({ values }) => {
      const upper = values.map((pair) => pair.top);
      const lower = values.map((pair) => pair.bottom);
      const lastLower = lower[lower.length - 1];
      return `${move(upper[0])}${curveSegment(upper, curve)}L${format(lastLower.x)},${format(
        lastLower.y,
      )}${reversePath(lower, curve)}Z`;
    })
    .join('');
}

export function sum(values: Iterable<number | null | undefined>) {
  let total = 0;
  for (const value of values) if (isFiniteNumber(value)) total += value;
  return total;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function numberFormatter(locale: string, options: Intl.NumberFormatOptions = {}) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

export function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions = {}) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatterCache.set(key, formatter);
  }
  return formatter;
}

export function axisFormatOptions(
  ticks: readonly number[],
  base: Intl.NumberFormatOptions = {},
): Intl.NumberFormatOptions {
  if (base.style === 'percent') return { maximumFractionDigits: 0, ...base };
  const largest = Math.max(0, ...ticks.map((tick) => Math.abs(tick)));
  if (largest >= 10_000) {
    return {
      ...base,
      notation: 'compact',
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    };
  }
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : 1;
  const fraction = step > 0 && step < 1 ? Math.min(4, Math.ceil(-Math.log10(step))) : 0;
  return {
    ...base,
    minimumFractionDigits: fraction,
    maximumFractionDigits: Math.max(fraction, 0),
  };
}

export function formatCategory(
  value: string | number | Date,
  locale: string,
  options: { date?: Intl.DateTimeFormatOptions; number?: Intl.NumberFormatOptions } = {},
) {
  if (value instanceof Date) return dateFormatter(locale, options.date).format(value);
  if (typeof value === 'number') return numberFormatter(locale, options.number).format(value);
  return value;
}

export function categoryTickPriority(
  count: number,
  mode: 'all' | 'ends' | 'auto',
  maxLabels = 12,
): (0 | 1 | null)[] {
  if (mode === 'all') return new Array(count).fill(0);
  if (mode === 'ends') {
    return Array.from({ length: count }, (_, index) =>
      index === 0 || index === count - 1 ? 0 : null,
    );
  }
  const stride = Math.max(1, Math.ceil(count / maxLabels));
  return Array.from({ length: count }, (_, index) => {
    if (index % stride !== 0) return null;
    return (index / stride) % 2 === 0 ? 0 : 1;
  });
}
