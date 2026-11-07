import { useState } from 'react';
import { page } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Lightbox, type LightboxItem, type LightboxProps } from '@/registry/ds/ui/lightbox';

const items: LightboxItem[] = [
  { id: 'lagoon', src: '/samples/lagoon.jpg', alt: 'A blue abstract landscape', title: 'Lagoon' },
  { id: 'dune', src: '/samples/dune.jpg', alt: 'A warm abstract landscape', title: 'Dune' },
];

function Gallery(props: Partial<LightboxProps>) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open gallery</Button>
      <Lightbox items={items} isOpen={isOpen} onOpenChange={setOpen} {...props} />
    </>
  );
}

describe('Lightbox', () => {
  it('connects navigation and thumbnails to selection and resets zoom for the next image', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<Gallery onSelectionChange={onSelectionChange} />, {
      provider: { motion: 'disabled' },
    });
    await screen.getByRole('button', { name: 'Open gallery' }).click();
    await expect.element(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    expect(document.querySelector('[data-slot="lightbox-viewport"]')).toHaveAttribute(
      'data-zoom',
      '1.5',
    );
    await page.getByRole('button', { name: 'Next image' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Dune' })).toBeVisible();
    expect(onSelectionChange).toHaveBeenLastCalledWith('dune');
    expect(document.querySelector('[data-slot="lightbox-viewport"]')).toHaveAttribute(
      'data-zoom',
      '1',
    );
    await expect.element(page.getByRole('button', { name: 'Next image' })).toBeDisabled();
    await page.getByRole('tab', { name: 'Image 1: Lagoon' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Lagoon' })).toBeVisible();
    await page.getByRole('button', { name: 'Close image viewer' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps a rejected controlled selection and falls back safely when its image disappears', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <Lightbox items={items} isOpen selectedKey="lagoon" onSelectionChange={onSelectionChange} />,
      { provider: { motion: 'disabled' } },
    );
    await page.getByRole('button', { name: 'Next image' }).click();
    expect(onSelectionChange).toHaveBeenLastCalledWith('dune');
    await expect.element(page.getByRole('dialog', { name: 'Lagoon' })).toBeVisible();
    await screen.rerender(<Lightbox items={[items[1]]} isOpen selectedKey="lagoon" />);
    await expect.element(page.getByRole('dialog', { name: 'Dune' })).toBeVisible();
    await screen.rerender(<Lightbox items={[]} isOpen />);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('makes a failed image recoverable and resolves labels through the provider and local override', async () => {
    const screen = await renderWithDS(
      <Gallery
        items={[{ id: 'missing', src: 'data:,unavailable', alt: 'Missing photo' }]}
        labels={{ retry: 'Reload photo' }}
      />,
      {
        provider: {
          motion: 'disabled',
          labels: { lightbox: { error: 'Photo unavailable', close: 'Leave viewer' } },
        },
      },
    );
    await screen.getByRole('button', { name: 'Open gallery' }).click();
    await expect.element(page.getByRole('alert')).toBeVisible();
    await expect.element(page.getByText('Photo unavailable', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reload photo' }).click();
    await expect.element(page.getByRole('alert')).toBeVisible();
    await expect.element(page.getByText('Photo unavailable', { exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Leave viewer' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps zoomed images scrollable inside a narrow viewport and is accessible in light, dark and RTL', async () => {
    const originalClass = document.documentElement.className;
    try {
      await page.viewport(375, 812);
      for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
        document.documentElement.classList.toggle('dark', 'dark' in options);
        const screen = await renderWithDS(<Lightbox items={items} isOpen />, {
          ...options,
          provider: { motion: 'disabled' },
        });
        const zoom = page.getByRole('button', { name: 'Zoom in', exact: true });
        await expect.element(zoom).toBeEnabled();
        await zoom.click();
        const viewport = document.querySelector<HTMLElement>('[data-slot="lightbox-viewport"]')!;
        expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
        expect(Math.abs(viewport.scrollLeft)).toBeCloseTo(
          (viewport.scrollWidth - viewport.clientWidth) / 2,
          0,
        );
        expect(viewport.getBoundingClientRect().right).toBeLessThanOrEqual(375);
        await expectNoA11yViolations(document.body);
        await screen.unmount();
      }
    } finally {
      document.documentElement.className = originalClass;
      await page.viewport(414, 896);
    }
  });
});
