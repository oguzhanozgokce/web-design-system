import { buildSchemes, type PaletteRequest } from '@/components/theme-builder/theme-model';

self.onmessage = ({ data }: MessageEvent<PaletteRequest>) => {
  self.postMessage({ ...data, schemes: buildSchemes(data.seed, data.style) });
};
