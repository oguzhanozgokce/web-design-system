import { userEvent } from 'vitest/browser';
import { renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';

it('changes accent colours while preserving neutral controls', async () => {
  const screen = await renderWithDS(
    <>
      <PreviewThemePicker />
      <PreviewThemeScope>
        <Button>Save</Button>
        <Button variant="soft">Cancel</Button>
      </PreviewThemeScope>
    </>,
  );
  const background = (name: string) =>
    getComputedStyle(screen.getByRole('button', { name }).element()).backgroundColor;
  await userEvent.click(
    screen.getByRole('radio', { name: 'Blue', exact: true }).element().closest('label')!,
  );
  const accent = background('Save');
  const neutral = background('Cancel');

  await userEvent.click(
    screen.getByRole('radio', { name: 'Teal', exact: true }).element().closest('label')!,
  );
  await expect.poll(() => background('Save')).not.toBe(accent);
  expect(background('Cancel')).toBe(neutral);
});
