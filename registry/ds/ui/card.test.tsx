import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  ClickableCard,
  SelectableCard,
  SelectableCardGroup,
} from '@/registry/ds/ui/card';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

function probe(className: string, property: 'backgroundColor' | 'color' = 'backgroundColor') {
  const element = document.createElement('div');
  element.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(element);
  const value = getComputedStyle(element)[property];
  element.remove();
  return value;
}

function targetOf(control: Element) {
  return control.closest('[data-slot=selectable-card-target]') as HTMLElement;
}

describe('Card', () => {
  it('renders an outline card with its parts and a heading title', async () => {
    const screen = await renderWithDS(
      <Card data-testid="card">
        <CardHeader
          title="Website redesign"
          description="Due 14 November"
          action={<Button variant="ghost">Edit</Button>}
        />
        <CardContent>12 of 18 tasks done</CardContent>
        <CardFooter>
          <Button>Open</Button>
        </CardFooter>
      </Card>,
    );
    const card = screen.getByTestId('card');
    await expect.element(card).toHaveAttribute('data-slot', 'card');
    await expect.element(card).toHaveAttribute('data-variant', 'outline');
    await expect.element(card).toHaveAttribute('data-padding', 'md');
    await expect.element(card).not.toHaveAttribute('data-surface');
    await expect
      .element(screen.getByRole('heading', { level: 3, name: 'Website redesign' }))
      .toBeVisible();
    await expect.element(screen.getByText('Due 14 November')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(card.element().querySelector('[data-slot=card-footer]')).not.toBeNull();

    const style = getComputedStyle(card.element());
    expect(style.backgroundColor).toBe(probe('bg-surface-raised'));
    expect(style.borderTopWidth).toBe('1px');
    expect(style.borderTopColor).toBe(probe('bg-outline-subtle'));
    expect(style.borderTopLeftRadius).toBe('20px');
    expect(style.paddingTop).toBe('16px');
  });

  it('paints each variant from its surface role and the requested heading level', async () => {
    const screen = await renderWithDS(
      <>
        <Card data-testid="elevated" variant="elevated">
          <CardTitle level={2}>Elevated</CardTitle>
        </Card>
        <Card data-testid="soft" variant="soft">
          <CardTitle>Soft</CardTitle>
        </Card>
        <Card data-testid="transparent" variant="transparent">
          <CardTitle>Transparent</CardTitle>
        </Card>
      </>,
    );
    const elevated = getComputedStyle(screen.getByTestId('elevated').element());
    expect(elevated.backgroundColor).toBe(probe('bg-surface-raised'));
    expect(elevated.boxShadow).not.toBe('none');
    expect(elevated.borderTopWidth).toBe('0px');
    expect(getComputedStyle(screen.getByTestId('soft').element()).backgroundColor).toBe(
      probe('bg-neutral-soft'),
    );
    expect(getComputedStyle(screen.getByTestId('transparent').element()).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Elevated' })).toBeVisible();
  });

  it('sizes the title and spacing with the padding', async () => {
    const screen = await renderWithDS(
      <>
        <Card data-testid="sm" padding="sm">
          <CardTitle>Small</CardTitle>
        </Card>
        <Card data-testid="lg" padding="lg">
          <CardTitle>Large</CardTitle>
        </Card>
      </>,
    );
    const small = screen.getByTestId('sm').element();
    const large = screen.getByTestId('lg').element();
    expect(getComputedStyle(small).paddingTop).toBe('12px');
    expect(getComputedStyle(large).paddingTop).toBe('24px');
    const smallTitle = getComputedStyle(screen.getByRole('heading', { name: 'Small' }).element());
    const largeTitle = getComputedStyle(screen.getByRole('heading', { name: 'Large' }).element());
    expect(smallTitle.fontSize).toBe('14px');
    expect(smallTitle.fontWeight).toBe('600');
    expect(largeTitle.fontSize).toBe('16px');
  });

  it('bleeds media to the card edges unless it is inset, with a concentric inset corner', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <Card data-testid="card" padding="lg">
          <CardMedia src={pixel} alt="Mountain lake at dawn" className="h-20" />
          <CardTitle>Weekend trip</CardTitle>
          <CardMedia inset src={pixel} alt="Trail map" className="h-20" />
        </Card>
      </div>,
    );
    const card = screen.getByTestId('card').element();
    const bleed = screen.getByRole('img', { name: 'Mountain lake at dawn' }).element();
    const inset = screen.getByRole('img', { name: 'Trail map' }).element();
    const cardBox = card.getBoundingClientRect();
    expect(bleed.getBoundingClientRect().width).toBeCloseTo(card.clientWidth, 0);
    expect(bleed.getBoundingClientRect().top).toBeCloseTo(cardBox.top + card.clientTop, 0);
    expect(getComputedStyle(bleed).borderTopLeftRadius).toBe('19px');
    expect(inset.getBoundingClientRect().width).toBeCloseTo(card.clientWidth - 48, 0);
    expect(inset).toHaveAttribute('data-inset', 'true');
    expect(getComputedStyle(inset).borderTopLeftRadius).toBe('8px');
  });
});

describe('ClickableCard', () => {
  it('renders a link named by all of its visible text, keeping the title a heading', async () => {
    const screen = await renderWithDS(
      <ClickableCard href="/photos" variant="outline">
        <CardHeader title="Photos" description="Updated 2 hours ago" />
        <CardContent>1,204 items</CardContent>
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {
      name: /^Photos\s*Updated 2 hours ago\s*1,204 items$/,
    });
    await expect.element(link).toHaveAttribute('href', '/photos');
    await expect.element(link).toHaveAttribute('data-slot', 'clickable-card');
    await expect.element(link).toHaveAttribute('data-variant', 'outline');
    await expect.element(link).not.toHaveAttribute('aria-labelledby');
    await expect.element(screen.getByRole('heading', { name: 'Photos' })).toBeVisible();
  });

  it('renders a button with phrasing content that fires onPress', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <ClickableCard onPress={onPress}>
        <CardHeader title="Blank folder" description="Start with no files" />
      </ClickableCard>,
    );
    const button = screen.getByRole('button', { name: /^Blank folder\s*Start with no files$/ });
    expect(button.element().querySelector('h3, div, p')).toBeNull();

    await button.click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('stays pending while an async onPress runs and ignores repeat presses', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <ClickableCard onPress={onPress}>
        <CardTitle>Import from CSV</CardTitle>
      </ClickableCard>,
    );
    const button = screen.getByRole('button', { name: 'Import from CSV' });

    await button.click();
    await expect.element(button).toHaveAttribute('data-pending', 'true');
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await button.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();

    finish();
    await expect.element(button).not.toHaveAttribute('data-pending');
  });

  it('takes the pending label from labels, then DSProvider, then the English default', async () => {
    const english = await renderWithDS(
      <ClickableCard isPending>
        <CardTitle>Import CSV</CardTitle>
      </ClickableCard>,
    );
    await expect.element(english.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await english.unmount();

    const screen = await renderWithDS(
      <>
        <ClickableCard isPending>
          <CardTitle>Import CSV</CardTitle>
        </ClickableCard>
        <ClickableCard isPending labels={{ pending: 'İçe aktarılıyor' }}>
          <CardTitle>CSV içe aktar</CardTitle>
        </ClickableCard>
      </>,
      { provider: { labels: { card: { pending: 'Yükleniyor' } } } },
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'İçe aktarılıyor' }))
      .toBeInTheDocument();
  });

  it('clears the pending state when the promise rejects', async () => {
    let fail: (reason: Error) => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)));
    const screen = await renderWithDS(
      <ClickableCard onPress={onPress}>
        <CardTitle>Sync team feed</CardTitle>
      </ClickableCard>,
    );
    const button = screen.getByRole('button', { name: 'Sync team feed' });

    await button.click();
    await expect.element(button).toHaveAttribute('data-pending', 'true');

    fail(new Error('Team unavailable'));
    await expect.element(button).not.toHaveAttribute('data-pending');
    await expect.element(screen.getByRole('progressbar')).not.toBeInTheDocument();
  });

  it('lets the consumer className win and accepts a render-prop className', async () => {
    const screen = await renderWithDS(
      <div className="flex w-96 flex-col items-start gap-2">
        <ClickableCard data-testid="narrow" className="w-40" onPress={() => {}}>
          <CardTitle>Blank folder</CardTitle>
        </ClickableCard>
        <ClickableCard
          data-testid="link"
          href="#shared"
          className={({ isDisabled }) => (isDisabled ? 'opacity-50' : 'w-48')}
        >
          <CardTitle>Shared files</CardTitle>
        </ClickableCard>
      </div>,
    );
    expect(screen.getByTestId('narrow').element().getBoundingClientRect().width).toBe(160);
    const link = screen.getByTestId('link').element();
    expect(link.getBoundingClientRect().width).toBe(192);
    expect(getComputedStyle(link).cursor).toBe('pointer');
  });

  it('lifts outline and elevated cards on hover, and darkens soft and transparent ones instead', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2 p-4">
        <ClickableCard href="#photos">
          <CardTitle>Photos</CardTitle>
        </ClickableCard>
        <ClickableCard href="#videos" variant="elevated">
          <CardTitle>Videos</CardTitle>
        </ClickableCard>
        <ClickableCard href="#music" variant="soft">
          <CardTitle>Music</CardTitle>
        </ClickableCard>
        <ClickableCard href="#books" variant="transparent">
          <CardTitle>Books</CardTitle>
        </ClickableCard>
      </div>,
      { provider: { motion: 'disabled' } },
    );
    for (const name of ['Photos', 'Videos']) {
      const link = screen.getByRole('link', { name });
      const resting = getComputedStyle(link.element()).boxShadow;
      await link.hover();
      await expect.element(link).toHaveAttribute('data-hovered', 'true');
      await expect.poll(() => getComputedStyle(link.element()).boxShadow).not.toBe(resting);
      await userEvent.unhover(link);
    }
    for (const [name, role] of [
      ['Music', 'bg-neutral-soft-hover'],
      ['Books', 'bg-neutral-soft'],
    ]) {
      const link = screen.getByRole('link', { name });
      await link.hover();
      await expect.poll(() => getComputedStyle(link.element()).backgroundColor).toBe(probe(role));
      expect(getComputedStyle(link.element()).boxShadow).toBe('none');
      await userEvent.unhover(link);
    }
  });
});

describe('SelectableCard', () => {
  it('toggles a standalone checkbox card from anywhere on the card', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCard onChange={onChange}>
        <CardHeader title="Automatic backup" description="Save new photos on Wi-Fi" />
        <CardContent>About 2 GB a month</CardContent>
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Automatic backup', exact: true });
    await expect.element(checkbox).toHaveAccessibleDescription('Save new photos on Wi-Fi');
    await expect.element(checkbox).not.toBeChecked();

    await screen.getByText('About 2 GB a month').click();
    await expect.element(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    const target = checkbox.element().closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-selected', 'true');

    await userEvent.keyboard(' ');
    await expect.element(checkbox).not.toBeChecked();
  });

  it('shows the error of an invalid standalone card next to its description', async () => {
    const screen = await renderWithDS(
      <SelectableCard isInvalid errorMessage="Accept the community guidelines to continue.">
        <CardHeader title="Community guidelines" description="Version 3, effective 1 March" />
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Community guidelines' });
    await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(checkbox)
      .toHaveAccessibleDescription(
        'Accept the community guidelines to continue. Version 3, effective 1 March',
      );
    await expect
      .element(screen.getByText('Accept the community guidelines to continue.'))
      .toBeVisible();
    const target = targetOf(checkbox.element());
    expect(target).toHaveAttribute('data-invalid', 'true');
    expect(getComputedStyle(target).borderTopColor).toBe(probe('bg-error'));
    expect(getComputedStyle(target).getPropertyValue('--focus-color').trim()).toBe(
      getComputedStyle(target).getPropertyValue('--error').trim(),
    );
  });

  it('rings the selected card in primary and fills its indicator with the solid primary', async () => {
    const screen = await renderWithDS(
      <>
        <SelectableCard defaultSelected>
          <CardTitle>Weekly digest</CardTitle>
        </SelectableCard>
        <SelectableCard>
          <CardTitle>Daily digest</CardTitle>
        </SelectableCard>
        <SelectableCard defaultSelected variant="soft">
          <CardTitle>Shared albums</CardTitle>
        </SelectableCard>
        <SelectableCard defaultSelected isInvalid>
          <CardTitle>Monthly report</CardTitle>
        </SelectableCard>
      </>,
      { provider: { motion: 'reduced' } },
    );
    const selected = targetOf(screen.getByRole('checkbox', { name: 'Weekly digest' }).element());
    const idle = targetOf(screen.getByRole('checkbox', { name: 'Daily digest' }).element());
    await userEvent.unhover(screen.getByText('Daily digest'));
    await expect.poll(() => idle.hasAttribute('data-hovered')).toBe(false);
    const selectedStyle = getComputedStyle(selected);
    expect(selectedStyle.borderTopColor).toBe(probe('bg-primary'));
    expect(selectedStyle.boxShadow).toContain('inset');
    expect(selectedStyle.backgroundColor).toBe(probe('bg-surface-raised'));
    expect(getComputedStyle(idle).borderTopColor).toBe(probe('bg-outline-subtle'));

    const indicator = selected.querySelector('[data-slot=selectable-card-indicator]')!;
    const idleIndicator = idle.querySelector('[data-slot=selectable-card-indicator]')!;
    expect(getComputedStyle(indicator).backgroundColor).toBe(probe('bg-primary-solid'));
    expect(getComputedStyle(indicator).color).toBe(probe('text-on-primary-solid', 'color'));
    expect(getComputedStyle(idleIndicator).backgroundColor).toBe(probe('bg-surface-raised'));
    expect(getComputedStyle(idleIndicator).borderTopColor).toBe(probe('bg-outline'));
    expect(getComputedStyle(idleIndicator.firstElementChild!).opacity).toBe('0');

    const soft = getComputedStyle(
      targetOf(screen.getByRole('checkbox', { name: 'Shared albums' }).element()),
    );
    expect(soft.borderTopWidth).toBe('1px');
    expect(soft.borderTopColor).toBe(probe('bg-primary'));

    const invalid = targetOf(screen.getByRole('checkbox', { name: 'Monthly report' }).element());
    expect(getComputedStyle(invalid).borderTopColor).toBe(probe('bg-error'));
    expect(
      getComputedStyle(invalid.querySelector('[data-slot=selectable-card-indicator]')!)
        .backgroundColor,
    ).toBe(probe('bg-error-solid'));
  });

  it('is named by all of its text, without repeating it as a description, when it has no title', async () => {
    const screen = await renderWithDS(
      <>
        <SelectableCard>
          <CardDescription>Send a copy of every project to the translator</CardDescription>
        </SelectableCard>
        <SelectableCard aria-label="Translator copies">
          <CardHeader title="Translations" description="Sent every Friday" />
        </SelectableCard>
      </>,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'Send a copy of every project to the translator',
    });
    await expect.element(checkbox).not.toHaveAttribute('aria-describedby');
    const labelled = screen.getByRole('checkbox', { name: 'Translator copies', exact: true });
    await expect.element(labelled).toHaveAccessibleDescription('Sent every Friday');
  });

  it.each([
    ['none', false],
    ['sm', true],
    ['md', true],
    ['lg', true],
  ] as const)(
    'keeps the first row clear of the indicator, centred on the title, with %s padding',
    async (padding, centred) => {
      const screen = await renderWithDS(
        <div className="w-80">
          <SelectableCard padding={padding}>
            <CardHeader
              title="Automatic backup for every photo and video on this device"
              description="Save new photos on Wi-Fi"
            />
          </SelectableCard>
        </div>,
      );
      const target = targetOf(screen.getByRole('checkbox', { name: /Automatic backup/ }).element());
      const header = target.querySelector('[data-slot=card-header]') as HTMLElement;
      const indicator = target.querySelector(
        '[data-slot=selectable-card-indicator]',
      ) as HTMLElement;
      const textEnd =
        header.getBoundingClientRect().right - parseFloat(getComputedStyle(header).paddingRight);
      const gap = indicator.getBoundingClientRect().left - textEnd;
      expect(gap).toBeGreaterThanOrEqual(8);
      if (!centred) return;
      const title = target.querySelector('[data-slot=card-title]')!;
      const titleMiddle =
        title.getBoundingClientRect().top + parseFloat(getComputedStyle(title).lineHeight) / 2;
      const box = indicator.getBoundingClientRect();
      expect(Math.abs(box.top + box.height / 2 - titleMiddle)).toBeLessThanOrEqual(1);
    },
  );

  it('shows the check instantly when DSProvider reduces motion', async () => {
    const screen = await renderWithDS(
      <SelectableCard defaultSelected>
        <CardTitle>Weekly digest</CardTitle>
      </SelectableCard>,
      { provider: { motion: 'reduced' } },
    );
    const indicator = screen
      .getByRole('checkbox', { name: 'Weekly digest' })
      .element()
      .closest('[data-slot=selectable-card-target]')
      ?.querySelector('[data-slot=selectable-card-indicator]') as HTMLElement;
    expect(getComputedStyle(indicator).transitionProperty).toBe('none');
    expect(getComputedStyle(indicator.firstElementChild as Element).transitionProperty).toBe(
      'none',
    );
  });

  it('picks one card in a single-selection group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup label="Plan" defaultValue="team" onChange={onChange}>
        <SelectableCard value="starter">
          <CardHeader title="Starter" description="One folder and one member" />
        </SelectableCard>
        <SelectableCard value="team">
          <CardHeader title="Team" description="Unlimited folders and shared albums" />
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByRole('radiogroup', { name: 'Plan' })).toBeVisible();
    const team = screen.getByRole('radio', { name: 'Team', exact: true });
    await expect.element(team).toBeChecked();
    await expect.element(team).toHaveAccessibleDescription('Unlimited folders and shared albums');

    await screen.getByText('One folder and one member').click();
    expect(onChange).toHaveBeenLastCalledWith('starter');
    await expect.element(screen.getByRole('radio', { name: 'Starter' })).toBeChecked();
    await expect.element(team).not.toBeChecked();
  });

  it('supports a controlled group value', async () => {
    function ControlledGroup() {
      const [plan, setPlan] = useState('starter');
      return (
        <>
          <SelectableCardGroup label="Plan" value={plan} onChange={setPlan}>
            <SelectableCard value="starter">
              <CardTitle>Starter</CardTitle>
            </SelectableCard>
            <SelectableCard value="team">
              <CardTitle>Team</CardTitle>
            </SelectableCard>
          </SelectableCardGroup>
          <output>{plan}</output>
        </>
      );
    }
    const screen = await renderWithDS(<ControlledGroup />);
    await expect.element(screen.getByRole('radio', { name: 'Starter' })).toBeChecked();
    await screen.getByText('Team').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('team');
    await expect.element(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
  });

  it('disables every card in a disabled group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup selectionMode="multiple" label="Back up" isDisabled onChange={onChange}>
        <SelectableCard value="photos">
          <CardTitle>Photos</CardTitle>
        </SelectableCard>
        <SelectableCard value="videos">
          <CardTitle>Videos</CardTitle>
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Photos' })).toBeDisabled();
    await expect.element(screen.getByRole('checkbox', { name: 'Videos' })).toBeDisabled();
    await screen.getByText('Photos').click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole('group', { name: 'Back up' }))
      .toHaveAttribute('data-disabled', 'true');
    const target = screen
      .getByRole('checkbox', { name: 'Photos' })
      .element()
      .closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(target!).opacity).toBe('0.5');
    expect(getComputedStyle(target!).cursor).toBe('not-allowed');
  });

  it('collects several values in a multiple-selection group and styles its cards', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup
        selectionMode="multiple"
        label="Notify me about"
        defaultValue={['projects']}
        onChange={onChange}
        orientation="horizontal"
        variant="soft"
        padding="sm"
      >
        <SelectableCard value="projects" variant="elevated">
          <CardTitle>Shared projects</CardTitle>
        </SelectableCard>
        <SelectableCard value="uploads">
          <CardTitle>Uploads</CardTitle>
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByRole('group', { name: 'Notify me about' })).toBeVisible();
    await screen.getByText('Uploads').click();
    expect(onChange).toHaveBeenLastCalledWith(['projects', 'uploads']);
    await expect.element(screen.getByRole('checkbox', { name: 'Uploads' })).toBeChecked();
    const card = (name: string) =>
      screen.getByRole('checkbox', { name }).element().closest('[data-slot=selectable-card]')!;
    expect(card('Uploads')).toHaveAttribute('data-variant', 'soft');
    expect(card('Uploads')).toHaveAttribute('data-padding', 'sm');
    expect(card('Shared projects')).toHaveAttribute('data-variant', 'elevated');
    expect(card('Shared projects')).toHaveAttribute('data-padding', 'sm');
  });

  it('shows the group error and marks every card invalid', async () => {
    const screen = await renderWithDS(
      <SelectableCardGroup label="Region" isInvalid errorMessage="Choose where to store data.">
        <SelectableCard value="eu">
          <CardTitle>Frankfurt</CardTitle>
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByText('Choose where to store data.')).toBeVisible();
    const target = screen
      .getByRole('radio', { name: 'Frankfurt' })
      .element()
      .closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-invalid', 'true');
  });

  it('throws when a card in a group has no value', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const selectionMode of ['single', 'multiple'] as const) {
      await expect(
        renderWithDS(
          <SelectableCardGroup label="Plan" selectionMode={selectionMode}>
            <SelectableCard>
              <CardTitle>Starter</CardTitle>
            </SelectableCard>
          </SelectableCardGroup>,
        ),
      ).rejects.toThrow('SelectableCard needs a value');
    }
    error.mockRestore();
  });
});

describe('Card accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid gap-4 p-4">
          {(['outline', 'elevated', 'soft', 'transparent'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardMedia src={pixel} alt="" className="h-12" />
              <CardHeader title={`${variant} card`} description="Supporting text for the card" />
              <CardContent>
                <Card variant="soft">
                  <CardDescription>Nested card text</CardDescription>
                </Card>
              </CardContent>
              <CardFooter>
                <Button variant="ghost">Details</Button>
              </CardFooter>
            </Card>
          ))}
          <ClickableCard href="/photos">
            <CardHeader title="Photos" description="Updated 2 hours ago" />
          </ClickableCard>
          <ClickableCard href="/videos" variant="soft">
            <CardHeader title="Videos" description="Updated yesterday" />
          </ClickableCard>
          <ClickableCard onPress={() => {}} isDisabled>
            <CardHeader title="Archived" description="Read only" />
          </ClickableCard>
          <SelectableCardGroup label="Plan" defaultValue="team" orientation="horizontal">
            <SelectableCard value="starter">
              <CardHeader title="Starter" description="One folder" />
            </SelectableCard>
            <SelectableCard value="team" variant="elevated">
              <CardHeader title="Team" description="Shared albums" />
            </SelectableCard>
            <SelectableCard value="studio" isDisabled variant="soft">
              <CardHeader title="Studio" description="Roles and history" />
            </SelectableCard>
          </SelectableCardGroup>
          <SelectableCardGroup label="Storage" isInvalid errorMessage="Choose a storage plan.">
            <SelectableCard value="cloud">
              <CardHeader title="Cloud" description="Synced everywhere" />
            </SelectableCard>
          </SelectableCardGroup>
          <SelectableCard defaultSelected>
            <CardHeader title="Automatic backup" description="Save new photos on Wi-Fi" />
          </SelectableCard>
          <SelectableCard defaultSelected isInvalid errorMessage="Turn off sync to keep this.">
            <CardHeader title="Offline copies" description="Keep files on this device" />
          </SelectableCard>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
