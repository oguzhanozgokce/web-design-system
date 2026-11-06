import { createTV, createTwMerge, cx, type ClassValue } from 'tailwind-variants/config';

const typeScale = [
  'display-lg',
  'display-md',
  'display-sm',
  'headline-lg',
  'headline-md',
  'headline-sm',
  'title-lg',
  'title-md',
  'title-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
];

const elevations = ['elevation-1', 'elevation-2', 'elevation-3', 'elevation-4', 'elevation-5'];

const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [{ text: typeScale }],
      shadow: [{ shadow: elevations }],
    },
  },
};

const merge = createTwMerge(twMergeConfig);

export const tv = createTV({ twMergeConfig });

export function cn(...inputs: ClassValue[]) {
  return merge(cx(...inputs) ?? '');
}

export type { VariantProps } from 'tailwind-variants';
