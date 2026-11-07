import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { InboxIcon, SearchIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState, type EmptyStateSize } from '@/registry/ds/ui/empty-state';

const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];

describe('EmptyState', () => {
  it('renders a heading, description and decorative icon', async () => {
    const screen = await renderWithDS(
      <EmptyState
        icon={<InboxIcon />}
        title="No projects yet"
        description="Projects you create or import appear here."
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'No projects yet' });
    await expect.element(heading).toBeVisible();
    await expect
      .element(screen.getByText('Projects you create or import appear here.'))
      .toBeVisible();
    const root = screen.container.querySelector('[data-slot="empty-state"]')!;
    expect(root.getAttribute('data-size')).toBe('md');
    const media = root.querySelector('[data-slot="media"]')!;
    expect(media.getAttribute('aria-hidden')).toBe('true');
    expect(media.getBoundingClientRect().width).toBe(48);
    expect(getComputedStyle(media).borderRadius).not.toBe('0px');
    expect(media.querySelector('svg')!.getBoundingClientRect().width).toBe(24);
  });

  it('puts the icon in a neutral soft well with a muted glyph', async () => {
    const screen = await renderWithDS(
      <>
        <EmptyState icon={<InboxIcon />} title="No projects yet" />
        <span data-testid="reference" className="bg-neutral-soft text-on-surface-variant" />
      </>,
      { dark: true },
    );
    const media = screen.container.querySelector('[data-slot="media"]')!;
    const reference = getComputedStyle(screen.getByTestId('reference').element());
    expect(getComputedStyle(media).backgroundColor).toBe(reference.backgroundColor);
    expect(getComputedStyle(media).color).toBe(reference.color);
  });

  it.each([
    ['sm', 14, 12, 40],
    ['md', 18, 14, 48],
    ['lg', 24, 16, 64],
  ] as const)('sets the type and icon well for size %s', async (size, title, body, well) => {
    const screen = await renderWithDS(
      <EmptyState size={size} icon={<InboxIcon />} title="No photos" description="Add some." />,
    );
    const root = screen.container.querySelector('[data-slot="empty-state"]')!;
    expect(root.getAttribute('data-size')).toBe(size);
    const titleNode = root.querySelector('[data-slot="title"]')!;
    expect(parseFloat(getComputedStyle(titleNode).fontSize)).toBe(title);
    expect(getComputedStyle(titleNode).fontWeight).toBe('600');
    const description = root.querySelector('[data-slot="description"]')!;
    expect(parseFloat(getComputedStyle(description).fontSize)).toBe(body);
    expect(root.querySelector('[data-slot="media"]')!.getBoundingClientRect().width).toBe(well);
  });

  it('follows the heading level it is given', async () => {
    const screen = await renderWithDS(<EmptyState headingLevel={3} title="No members" />);
    await expect
      .element(screen.getByRole('heading', { level: 3, name: 'No members' }))
      .toBeInTheDocument();
  });

  it('styles the primary and secondary actions for each size', async () => {
    const screen = await renderWithDS(
      <div>
        {sizes.map((size) => (
          <EmptyState
            key={size}
            size={size}
            title={`Empty ${size}`}
            primaryAction={<Button>Create {size}</Button>}
            secondaryAction={<ButtonLink href="#import">Import {size}</ButtonLink>}
          />
        ))}
      </div>,
    );
    const expected = {
      sm: ['soft', 'neutral', 'ghost', 'sm'],
      md: ['solid', 'primary', 'soft', 'md'],
      lg: ['solid', 'primary', 'soft', 'md'],
    } as const;
    for (const size of sizes) {
      const [primary, tone, secondary, buttonSize] = expected[size];
      const create = screen.getByRole('button', { name: `Create ${size}` });
      await expect.element(create).toHaveAttribute('data-variant', primary);
      await expect.element(create).toHaveAttribute('data-tone', tone);
      await expect.element(create).toHaveAttribute('data-size', buttonSize);
      const link = screen.getByRole('link', { name: `Import ${size}` });
      await expect.element(link).toHaveAttribute('data-variant', secondary);
      await expect.element(link).toHaveAttribute('data-tone', 'neutral');
      await expect.element(link).toHaveAttribute('data-size', buttonSize);
    }
  });

  it('lets an explicit button variant win and calls its handler', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <EmptyState
        title="No results for “lake”"
        primaryAction={
          <Button variant="outline" onPress={onPress}>
            Clear search
          </Button>
        }
      />,
    );
    const button = screen.getByRole('button', { name: 'Clear search' });
    await expect.element(button).toHaveAttribute('data-variant', 'outline');
    await button.click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('prefers an illustration over the icon and renders extra content', async () => {
    const screen = await renderWithDS(
      <EmptyState
        size="lg"
        icon={<SearchIcon data-testid="icon" />}
        illustration={<svg data-testid="art" viewBox="0 0 10 10" />}
        title="No projects"
      >
        <p>Projects group your files by topic.</p>
      </EmptyState>,
    );
    await expect.element(screen.getByTestId('art')).toBeInTheDocument();
    expect(screen.container.querySelector('[data-testid="icon"]')).toBeNull();
    await expect.element(screen.getByText('Projects group your files by topic.')).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {sizes.map((size) => (
            <EmptyState
              key={size}
              size={size}
              icon={<InboxIcon />}
              title="No photos match these filters"
              description="Try a wider date range or clear the album filter."
              primaryAction={<Button>Clear filters</Button>}
              secondaryAction={<Button>Show all photos</Button>}
            />
          ))}
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
