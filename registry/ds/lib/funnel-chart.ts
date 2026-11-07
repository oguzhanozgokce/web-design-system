export interface FunnelMetrics {
  value: number | null;
  previousRate: number | null;
  firstRate: number | null;
  height: number;
}

export function funnelMetrics(values: readonly number[]): FunnelMetrics[] {
  const valid = values.map((value) => (Number.isFinite(value) && value >= 0 ? value : null));
  const maximum = valid.reduce<number>((max, value) => Math.max(max, value ?? 0), 0);
  return valid.map((value, index) => ({
    value,
    previousRate:
      index > 0 && value !== null && valid[index - 1] !== null && valid[index - 1]! > 0
        ? value / valid[index - 1]!
        : null,
    firstRate: value !== null && valid[0] !== null && valid[0] > 0 ? value / valid[0] : null,
    height: value !== null && maximum > 0 ? value / maximum : 0,
  }));
}

export function funnelPath(start: number, end: number, width = 200, height = 200) {
  const top = ((1 - start) * height) / 2;
  const bottom = height - top;
  const nextTop = ((1 - end) * height) / 2;
  const nextBottom = height - nextTop;
  return `M0 ${top}H${width * 0.3}C${width * 0.65} ${top} ${width * 0.65} ${nextTop} ${width} ${nextTop}V${nextBottom}C${width * 0.65} ${nextBottom} ${width * 0.65} ${bottom} ${width * 0.3} ${bottom}H0Z`;
}
