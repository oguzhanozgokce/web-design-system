import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { galleryPreviews } from '@/components/showcase/previews';

function Previews() {
  return (
    <div className="grid grid-cols-2 gap-4 bg-canvas p-4">
      {Object.entries(galleryPreviews).map(([name, Preview]) => (
        <div key={name} data-preview={name} className="flex justify-center">
          <Preview />
        </div>
      ))}
    </div>
  );
}

describe('Gallery previews', () => {
  it('renders one preview per gallery entry with the current component APIs', async () => {
    const screen = await renderWithDS(<Previews />);

    await expect.element(screen.getByRole('button', { name: 'Save' }).first()).toBeVisible();
    const button = document.querySelector('[data-preview="button"] [data-slot="button"]');
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'sm');
    const variants = Array.from(
      document.querySelectorAll('[data-preview="button"] [data-slot="button"]'),
    ).map(
      (element) => `${element.getAttribute('data-variant')}:${element.getAttribute('data-tone')}`,
    );
    expect(variants).toEqual(['solid:primary', 'soft:neutral', 'outline:neutral', 'ghost:error']);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<Previews />, options);
      await expect.element(screen.getByRole('button', { name: 'Save' }).first()).toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
