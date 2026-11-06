import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { InboxIcon, SearchIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState, type EmptyStateSize } from '@/registry/ds/ui/empty-state';

const sizes: EmptyStateSize[] = ['compact', 'default', 'page'];

describe('EmptyState', () => {
  it('renders a heading, description and decorative icon', async () => {
    const screen = await renderWithDS(
      <EmptyState
        icon={<InboxIcon />}
        title="No invoices yet"
        description="Invoices you create or import appear here."
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'No invoices yet' });
    await expect.element(heading).toBeVisible();
    await expect
      .element(screen.getByText('Invoices you create or import appear here.'))
      .toBeVisible();
    const root = screen.container.querySelector('[data-slot="empty-state"]')!;
    expect(root.getAttribute('data-size')).toBe('default');
    const media = root.querySelector('[data-slot="media"]')!;
    expect(media.getAttribute('aria-hidden')).toBe('true');
    expect(media.className).toMatch(/rounded-full/);
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
      compact: ['text', 'text', 'sm'],
      default: ['filled', 'text', 'md'],
      page: ['filled', 'outlined', 'md'],
    } as const;
    for (const size of sizes) {
      const [primary, secondary, buttonSize] = expected[size];
      const create = screen.getByRole('button', { name: `Create ${size}` });
      await expect.element(create).toHaveAttribute('data-variant', primary);
      await expect.element(create).toHaveAttribute('data-size', buttonSize);
      await expect
        .element(screen.getByRole('link', { name: `Import ${size}` }))
        .toHaveAttribute('data-variant', secondary);
    }
  });

  it('lets an explicit button variant win and calls its handler', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <EmptyState
        title="No results for “acme”"
        primaryAction={
          <Button variant="tonal" onPress={onPress}>
            Clear search
          </Button>
        }
      />,
    );
    const button = screen.getByRole('button', { name: 'Clear search' });
    await expect.element(button).toHaveAttribute('data-variant', 'tonal');
    await button.click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('prefers an illustration over the icon and renders extra content', async () => {
    const screen = await renderWithDS(
      <EmptyState
        size="page"
        icon={<SearchIcon data-testid="icon" />}
        illustration={<svg data-testid="art" viewBox="0 0 10 10" />}
        title="No projects"
      >
        <p>Projects group invoices by client.</p>
      </EmptyState>,
    );
    await expect.element(screen.getByTestId('art')).toBeInTheDocument();
    expect(screen.container.querySelector('[data-testid="icon"]')).toBeNull();
    await expect.element(screen.getByText('Projects group invoices by client.')).toBeVisible();
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
              title="No orders match these filters"
              description="Try a wider date range or clear the status filter."
              primaryAction={<Button>Clear filters</Button>}
              secondaryAction={<Button>Export all orders</Button>}
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
