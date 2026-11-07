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
  fast: 150,
  medium: 250,
  slow: 350,
  shimmer: 2000,
  pulse: 1800,
} as const;

export const motionEasings = {
  fluid: [0.32, 0.72, 0, 1],
  outQuad: [0.25, 0.46, 0.45, 0.94],
  out: [0, 0, 0.2, 1],
} as const;

export function fluidTween(duration: number = motionDurations.medium) {
  return { type: 'tween' as const, duration: duration / 1000, ease: motionEasings.fluid };
}

export const pressScale = 0.97;
