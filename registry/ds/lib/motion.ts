export type MotionSpeed = 'fast' | 'medium' | 'slow';

export type MotionProfile = 'expressive' | 'productive';

export type MotionPreference = 'system' | 'reduced' | 'disabled';

interface SpringValues {
  dampingRatio: number;
  stiffness: number;
}

const expressiveSpatial: Record<MotionSpeed, SpringValues> = {
  fast: { dampingRatio: 0.65, stiffness: 800 },
  medium: { dampingRatio: 0.8, stiffness: 380 },
  slow: { dampingRatio: 0.8, stiffness: 200 },
};

const productiveSpatial: Record<MotionSpeed, SpringValues> = {
  fast: { dampingRatio: 0.9, stiffness: 1400 },
  medium: { dampingRatio: 0.9, stiffness: 700 },
  slow: { dampingRatio: 0.9, stiffness: 300 },
};

const effects: Record<MotionSpeed, SpringValues> = {
  fast: { dampingRatio: 1, stiffness: 3800 },
  medium: { dampingRatio: 1, stiffness: 1600 },
  slow: { dampingRatio: 1, stiffness: 800 },
};

function toSpring({ dampingRatio, stiffness }: SpringValues) {
  return {
    type: 'spring' as const,
    stiffness,
    damping: 2 * dampingRatio * Math.sqrt(stiffness),
    mass: 1,
  };
}

export function spatialSpring(
  speed: MotionSpeed = 'medium',
  profile: MotionProfile = 'expressive',
) {
  return toSpring((profile === 'productive' ? productiveSpatial : expressiveSpatial)[speed]);
}

export function effectSpring(speed: MotionSpeed = 'medium') {
  return toSpring(effects[speed]);
}

export const motionDurations = {
  short: 150,
  medium: 250,
  long: 400,
  shimmer: 1200,
  pulse: 1800,
} as const;

export const motionEasings = {
  standard: [0.2, 0, 0, 1],
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15],
} as const;

export const pressScale = 0.96;
