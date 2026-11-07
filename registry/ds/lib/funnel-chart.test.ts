import { funnelMetrics, funnelPath } from '@/registry/ds/lib/funnel-chart';

describe('funnel metrics', () => {
  it('keeps previous-step and first-step denominators separate', () => {
    const metrics = funnelMetrics([12400, 8680, 4340, 1302]);
    expect(metrics.map((entry) => entry.previousRate)).toEqual([null, 0.7, 0.5, 0.3]);
    expect(metrics.map((entry) => entry.firstRate)).toEqual([1, 0.7, 0.35, 0.105]);
    expect(metrics.map((entry) => entry.height)).toEqual([1, 0.7, 0.35, 0.105]);
  });

  it('preserves zero counts without inventing conversion from a zero baseline', () => {
    expect(funnelMetrics([0, 0])).toEqual([
      { value: 0, previousRate: null, firstRate: null, height: 0 },
      { value: 0, previousRate: null, firstRate: null, height: 0 },
    ]);
    expect(funnelMetrics([10, 0])[1].previousRate).toBe(0);
    expect(funnelMetrics([])).toEqual([]);
  });

  it('marks invalid observations as missing and does not silently skip them', () => {
    const metrics = funnelMetrics([100, -2, 20, NaN, Infinity]);
    expect(metrics.map((entry) => entry.value)).toEqual([100, null, 20, null, null]);
    expect(metrics[2].previousRate).toBeNull();
    expect(metrics[2].firstRate).toBe(0.2);
    expect(funnelMetrics([NaN, 20])[1].firstRate).toBeNull();
  });

  it('shows increases honestly and scales all segments against the largest count', () => {
    const metrics = funnelMetrics([10, 20, 5]);
    expect(metrics[1].previousRate).toBe(2);
    expect(metrics.map((entry) => entry.height)).toEqual([0.5, 1, 0.25]);
  });

  it('joins adjacent segments at the same centred height, including a zero-width neck', () => {
    expect(funnelPath(1, 0.5)).toBe('M0 0H60C130 0 130 50 200 50V150C130 150 130 200 60 200H0Z');
    expect(funnelPath(0.5, 0)).toBe(
      'M0 50H60C130 50 130 100 200 100V100C130 100 130 150 60 150H0Z',
    );
  });
});
