import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { cdp } from 'vitest/browser';
import { DSProvider, useMotionPreference } from '@/registry/ds/ui/ds-provider';

function Probe() {
  const { spatialEnabled } = useMotionPreference();
  return <span data-testid="probe" data-spatial={String(spatialEnabled)} />;
}

describe('DSProvider', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  it('hydrates server HTML without a mismatch for users who prefer reduced motion, then applies it', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <DSProvider>
        <Probe />
      </DSProvider>,
    );
    document.body.append(container);
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    const root = hydrateRoot(
      container,
      <DSProvider>
        <Probe />
      </DSProvider>,
    );
    try {
      await expect
        .poll(() => container.querySelector('[data-testid="probe"]')?.getAttribute('data-spatial'))
        .toBe('false');
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
      root.unmount();
      container.remove();
    }
  });
});
