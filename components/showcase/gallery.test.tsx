import { renderWithDS } from '@/test/utils';
import { ComponentGallery } from '@/components/showcase/gallery';

it('searches and filters the entire catalogue beyond the selected homepage components', async () => {
  const entries = [
    { name: 'button', title: 'Button', category: 'actions' },
    { name: 'checkbox', title: 'Checkbox', category: 'inputs' },
    { name: 'not-found', title: 'Not Found', category: 'feedback' },
  ].map((entry) => ({ ...entry, description: '', href: `/docs/${entry.name}` }));
  const screen = await renderWithDS(
    <ComponentGallery entries={entries} categories={[{ id: 'feedback', label: 'Feedback' }]} />,
  );
  await expect.element(screen.getByRole('link', { name: 'Button', exact: true })).toBeVisible();
  await expect
    .element(screen.getByRole('link', { name: 'Not Found', exact: true }))
    .not.toBeInTheDocument();
  await screen.getByRole('searchbox', { name: 'Search components' }).fill('Not Found');
  await expect.element(screen.getByRole('link', { name: 'Not Found', exact: true })).toBeVisible();
  await screen.getByRole('searchbox', { name: 'Search components' }).fill('');
  await screen.getByRole('row', { name: 'Feedback', exact: true }).click();
  await expect.element(screen.getByRole('link', { name: 'Not Found', exact: true })).toBeVisible();
  await screen.getByRole('row', { name: 'Explore', exact: true }).click();
  await screen.getByRole('button', { name: 'Explore all 3 components' }).click();
  await expect.element(screen.getByRole('link', { name: 'Checkbox', exact: true })).toBeVisible();
});
