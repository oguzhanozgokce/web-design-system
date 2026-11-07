import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { cdp, page } from 'vitest/browser';
import { renderWithDS } from '@/test/utils';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { Dialog, DialogBody, DialogHeader, DialogTrigger } from '@/registry/ds/ui/dialog';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';
import { DSProvider, useMotionPreference } from '@/registry/ds/ui/ds-provider';

function Probe() {
  const { spatialEnabled } = useMotionPreference();
  return <span data-testid="probe" data-spatial={String(spatialEnabled)} />;
}

describe('DSProvider', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  it('scopes CSS motion across buttons, toggles and portals while respecting a nested provider', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <>
          <Button>Save</Button>
          <ButtonLink href="/docs">Docs</ButtonLink>
          <ToggleButton>Watch</ToggleButton>
          <DSProvider motion="system">
            <ToggleButton>System motion</ToggleButton>
          </DSProvider>
          <DialogTrigger>
            <Button>Open</Button>
            <Dialog>
              <DialogHeader title="Preferences" />
              <DialogBody>
                <ToggleButton>Portal toggle</ToggleButton>
              </DialogBody>
            </Dialog>
          </DialogTrigger>
        </>,
        { provider: { motion } },
      );
      await screen.getByRole('button', { name: 'Open', exact: true }).click();
      for (const control of [
        screen.getByRole('button', { name: 'Save', exact: true }),
        screen.getByRole('link', { name: 'Docs' }),
        screen.getByRole('button', { name: 'Watch' }),
        page.getByRole('button', { name: 'Portal toggle' }),
      ]) {
        const element = control.element();
        element.setAttribute('data-pressed', 'true');
        await expect.poll(() => getComputedStyle(element).scale).toBe('1');
        if (motion === 'disabled') expect(getComputedStyle(element).transitionDuration).toBe('0s');
      }
      const nested = screen.getByRole('button', { name: 'System motion' }).element();
      nested.setAttribute('data-pressed', 'true');
      await expect.poll(() => getComputedStyle(nested).scale).toBe('0.97');
      await screen.unmount();
    }
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
