'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import {
  defaultSettings,
  type PaletteRequest,
  type SchemeSet,
  type ThemePalette,
} from '@/components/theme-builder/theme-model';

function samePalette(a: PaletteRequest, b: PaletteRequest) {
  return a.seed === b.seed && a.style === b.style;
}

export function useThemePalette(settings: PaletteRequest, initialSchemes: SchemeSet) {
  const [palette, setPalette] = useState<ThemePalette>({
    seed: defaultSettings.seed,
    style: defaultSettings.style,
    schemes: initialSchemes,
  });
  const [hasError, setError] = useState(false);
  const enqueue = useRef<((request: PaletteRequest) => void) | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('./theme-worker.ts', import.meta.url), { type: 'module' });
    let latest: PaletteRequest = defaultSettings;
    let completed: PaletteRequest = defaultSettings;
    let isWorking = false;
    let hasFailed = false;

    function request(next: PaletteRequest) {
      latest = next;
      if (hasFailed || isWorking || samePalette(next, completed)) return;
      isWorking = true;
      worker.postMessage(next);
    }

    enqueue.current = request;
    worker.onmessage = ({ data }: MessageEvent<ThemePalette>) => {
      isWorking = false;
      if (samePalette(data, latest)) {
        completed = data;
        startTransition(() => setPalette(data));
      } else {
        request(latest);
      }
    };
    worker.onerror = () => {
      isWorking = false;
      hasFailed = true;
      setError(true);
    };

    return () => {
      enqueue.current = null;
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    enqueue.current?.({ seed: settings.seed, style: settings.style });
  }, [settings.seed, settings.style]);

  return { palette, hasError, isUpdating: !samePalette(settings, palette) };
}
