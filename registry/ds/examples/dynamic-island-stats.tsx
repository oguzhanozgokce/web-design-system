'use client';

import { useEffect, useState } from 'react';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartLegend, type ChartLegendItem, type ChartSeries } from '@/registry/ds/ui/chart';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

interface Hour {
  hour: string;
  direct: number;
  search: number;
  social: number;
}

const firstHours: Hour[] = [
  [42, 31, 12],
  [58, 40, 18],
  [77, 52, 21],
  [91, 63, 30],
  [86, 71, 27],
  [104, 66, 35],
  [97, 74, 41],
  [112, 80, 38],
  [126, 88, 47],
  [118, 92, 44],
  [133, 97, 52],
  [61, 43, 22],
].map(([direct, search, social], index) => ({
  hour: `${String(index + 8).padStart(2, '0')}:00`,
  direct,
  search,
  social,
}));

const series: ChartSeries<Hour>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'social', label: 'Social', value: 'social' },
];

const legend: ChartLegendItem[] = [
  { id: 'direct', label: 'Direct', color: 'chart-1' },
  { id: 'search', label: 'Search', color: 'chart-2' },
  { id: 'social', label: 'Social', color: 'chart-3' },
];

function visits(hour: Hour) {
  return hour.direct + hour.search + hour.social;
}

function arrive(hours: Hour[], tick: number): Hour[] {
  const last = hours[hours.length - 1];
  const next = {
    ...last,
    direct: last.direct + 2 + (tick % 3),
    search: last.search + 1 + (tick % 2),
    social: last.social + (tick % 4 === 0 ? 2 : 1),
  };
  return visits(next) > 300 ? firstHours : [...hours.slice(0, -1), next];
}

export default function DynamicIslandStats() {
  const [hours, setHours] = useState(firstHours);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExpanded, setExpanded] = useState(true);
  const today = hours.reduce((sum, hour) => sum + visits(hour), 0);
  const active = activeIndex == null ? null : hours[activeIndex];

  useEffect(() => {
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      setHours((current) => arrive(current, tick));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-64 w-full items-center justify-center">
      <DynamicIsland title="Visits today" isExpanded={isExpanded} onExpandedChange={setExpanded}>
        <DynamicIslandCompact
          leading={<ActivityBars count={3} className="text-success" />}
          trailing={<RollingNumber value={today} />}
        >
          Live
        </DynamicIslandCompact>
        <DynamicIslandExpanded className="gap-3 px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs text-on-surface-variant">
                {active ? active.hour : 'Visits today'}
              </span>
              <RollingNumber
                value={active ? visits(active) : today}
                className="text-2xl font-semibold tracking-tight"
              />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <ActivityBars count={3} size="sm" />
              Live
            </span>
          </div>
          <BarChart
            aria-label="Visits per hour today"
            description="Visits by source for each hour since 08:00, stacked."
            data={hours}
            category="hour"
            series={series}
            layout="stacked"
            height={84}
            barGap={4}
            valueAxis={{ isVisible: false }}
            categoryAxis={{ ticks: 'ends' }}
            showGrid={false}
            legend="none"
            tooltip="none"
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            categoryDirection="ltr"
            className="[--chart-surface:var(--surface-container-lowest)]"
          />
          <ChartLegend items={legend} className="justify-center" />
        </DynamicIslandExpanded>
      </DynamicIsland>
    </div>
  );
}
