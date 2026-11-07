import { createTV, createTwMerge, cx, type ClassValue } from 'tailwind-variants/config';

const twMergeConfig = {
  extend: {
    theme: {
      radius: ['control', 'field', 'item', 'overlay', 'container', 'dialog'],
      ease: ['fluid', 'out-quad'],
    },
  },
};

const merge = createTwMerge(twMergeConfig);

export const tv = createTV({ twMergeConfig });

export function cn(...inputs: ClassValue[]) {
  return merge(cx(...inputs) ?? '');
}

export type { VariantProps } from 'tailwind-variants';
