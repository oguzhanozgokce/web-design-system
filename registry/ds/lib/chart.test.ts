import {
  areaPath,
  axisFormatOptions,
  bandScale,
  categoryTickPriority,
  extent,
  linePath,
  linearScale,
  niceTicks,
  normalizeRows,
  pointScale,
  stack,
} from '@/registry/ds/lib/chart';

function controlPoints(path: string) {
  return [...path.matchAll(/C([^C]+)/g)].map((match) =>
    match[1].split(/[ ,]/).filter(Boolean).map(Number),
  );
}

describe('lib/chart', () => {
  it('rounds value domains to nice ticks', () => {
    expect(niceTicks(0, 48.2, 4)).toEqual({
      domain: [0, 50],
      ticks: [0, 10, 20, 30, 40, 50],
      step: 10,
    });
    expect(niceTicks(-11, 22, 4).ticks).toEqual([-20, -10, 0, 10, 20, 30]);
    expect(niceTicks(0, 0).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(5, 5).domain).toEqual([0, 5]);
    expect(niceTicks(-3, -3).domain[1]).toBe(0);
  });

  it('maps values with linear, band and point scales', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(5)).toBe(50);
    expect(scale.invert(25)).toBe(2.5);
    const band = bandScale(4, { padding: 0.2 });
    expect(band.step).toBe(0.25);
    expect(band.bandwidth).toBeCloseTo(0.2);
    expect(band.start(1)).toBeCloseTo(0.275);
    expect(band.center(1)).toBeCloseTo(0.375);
    expect(band.indexAt(0.99)).toBe(3);
    const point = pointScale(5);
    expect(point.position(4)).toBe(1);
    expect(point.indexAt(0.6)).toBe(2);
    expect(pointScale(1).position(0)).toBe(0.5);
  });

  it('stacks positive values up and negative values down from zero', () => {
    const layout = stack([
      [3, -2, null],
      [4, -1, 5],
    ]);
    expect(layout.segments[0]).toEqual([{ start: 0, end: 3 }, { start: 0, end: -2 }, null]);
    expect(layout.segments[1]).toEqual([
      { start: 3, end: 7 },
      { start: -2, end: -3 },
      { start: 0, end: 5 },
    ]);
    expect(layout.positiveTotals).toEqual([7, 0, 5]);
    expect(layout.negativeTotals).toEqual([0, -3, 0]);
    expect([layout.min, layout.max]).toEqual([-3, 7]);
    expect(
      normalizeRows([
        [1, 3],
        [3, null],
      ]),
    ).toEqual([
      [0.25, 1],
      [0.75, null],
    ]);
    expect(extent([4, null, -2, 9])).toEqual([-2, 9]);
  });

  it('draws linear, step and monotone paths that break at missing values', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, null, { x: 3, y: 3 }, { x: 4, y: 4 }];
    expect(linePath(points, 'linear')).toBe('M0,0L1,1M3,3L4,4');
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        'step',
      ),
    ).toBe('M0,0H5V10H10');
    expect(
      areaPath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        [
          { x: 0, y: 100 },
          { x: 10, y: 100 },
        ],
        'linear',
      ),
    ).toBe('M0,0L10,10L10,100L0,100Z');

    const rising = [0, 10, 11, 30].map((y, x) => ({ x: x * 10, y }));
    const path = linePath(rising, 'monotone');
    const segments = controlPoints(path);
    expect(segments).toHaveLength(3);
    segments.forEach(([, y1, , y2], index) => {
      const low = rising[index].y;
      const high = rising[index + 1].y;
      for (const y of [y1, y2]) {
        expect(y).toBeGreaterThanOrEqual(low - 1e-9);
        expect(y).toBeLessThanOrEqual(high + 1e-9);
      }
    });
  });

  it('picks compact or fractional axis formats from the ticks', () => {
    expect(axisFormatOptions([0, 10_000, 20_000]).notation).toBe('compact');
    expect(axisFormatOptions([0, 0.5, 1]).minimumFractionDigits).toBe(1);
    expect(axisFormatOptions([0, 10, 20]).maximumFractionDigits).toBe(0);
    expect(axisFormatOptions([0, 0.5, 1], { style: 'percent' }).style).toBe('percent');
  });

  it('thins category labels by priority', () => {
    expect(categoryTickPriority(5, 'ends')).toEqual([0, null, null, null, 0]);
    expect(categoryTickPriority(3, 'all')).toEqual([0, 0, 0]);
    const auto = categoryTickPriority(30, 'auto');
    expect(auto.filter((priority) => priority !== null)).toHaveLength(10);
    expect(auto.slice(0, 7)).toEqual([0, null, null, 1, null, null, 0]);
  });
});
