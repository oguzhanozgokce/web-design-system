import { fluidTween } from '@/registry/ds/lib/motion';

export function entrance(delay = 0, seconds = 0.6) {
  return { ...fluidTween(seconds * 1000), delay };
}
