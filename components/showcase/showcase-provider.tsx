'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { DSProvider } from '@/registry/ds/ui/ds-provider';

export function ShowcaseProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  return <DSProvider navigate={(href) => router.push(href)}>{children}</DSProvider>;
}
