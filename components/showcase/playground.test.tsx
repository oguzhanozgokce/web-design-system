import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Playground } from '@/components/showcase/playground';

describe('Homepage playground', () => {
  it('connects the period to the chart and keeps choices when switching panels', async () => {
    const screen = await renderWithDS(<Playground />, { provider: { motion: 'disabled' } });
    await screen.getByRole('radio', { name: 'Last week', exact: true }).click();
    await expect.element(screen.getByText('1,089', { exact: true })).toBeVisible();
    await expect.element(screen.getByRole('group', { name: 'Visits last week' })).toBeVisible();
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Add your first project' }).element().closest('label')!,
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Invite your team' }).element().closest('label')!,
    );
    await screen.getByRole('tab', { name: 'Preferences' }).click();
    await userEvent.click(
      screen.getByRole('switch', { name: 'Project notifications' }).element().closest('label')!,
    );
    await screen.getByRole('tab', { name: 'Overview' }).click();
    await expect.element(screen.getByRole('heading', { name: 'You are all set' })).toBeVisible();
    await expect.element(screen.getByText('1,089', { exact: true })).toBeVisible();
    await screen.getByRole('tab', { name: 'Preferences' }).click();
    await expect
      .element(screen.getByRole('switch', { name: 'Project notifications' }))
      .not.toBeChecked();
  });

  it('keeps the composed preview accessible in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<Playground />, {
        ...options,
        provider: { motion: 'disabled' },
      });
      await expectNoA11yViolations(screen.container);
      await screen.getByRole('tab', { name: 'Preferences' }).click();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
