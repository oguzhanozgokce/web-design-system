'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { effectSpring, spatialSpring } from '@/registry/ds/lib/motion';

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const Element = motion[as];
  return (
    <Element
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{
        y: { ...spatialSpring('slow'), delay },
        opacity: { ...effectSpring('slow'), delay },
      }}
    >
      {children}
    </Element>
  );
}
