'use client';

import { useEffect, useState } from 'react';
import { seedsFromImage, type ImageSeedSource } from '@/registry/ds/lib/dynamic-color';

export type ImageSeedStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseImageSeedOptions {
  count?: number;
  fallback?: string;
}

export interface ImageSeedResult {
  seed: string | null;
  seeds: string[];
  status: ImageSeedStatus;
  error: Error | null;
}

interface ImageSeedState {
  request: { source: ImageSeedSource; count: number; fallback: string | undefined } | null;
  seeds: string[];
  status: 'ready' | 'error';
  error: Error | null;
}

const idle: ImageSeedResult = { seed: null, seeds: [], status: 'idle', error: null };
const loading: ImageSeedResult = { seed: null, seeds: [], status: 'loading', error: null };

export function useImageSeed(
  source: ImageSeedSource | null | undefined,
  { count = 4, fallback }: UseImageSeedOptions = {},
): ImageSeedResult {
  const [state, setState] = useState<ImageSeedState>({
    request: null,
    seeds: [],
    status: 'ready',
    error: null,
  });

  useEffect(() => {
    if (!source) return;
    const request = { source, count, fallback };
    const controller = new AbortController();
    seedsFromImage(source, { count, fallback, signal: controller.signal }).then(
      (seeds) => setState({ request, seeds, status: 'ready', error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          request,
          seeds: [],
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    );
    return () => controller.abort();
  }, [source, count, fallback]);

  if (!source) return idle;
  const { request } = state;
  if (
    !request ||
    request.source !== source ||
    request.count !== count ||
    request.fallback !== fallback
  ) {
    return loading;
  }
  return {
    seed: state.seeds[0] ?? null,
    seeds: state.seeds,
    status: state.status,
    error: state.error,
  };
}
