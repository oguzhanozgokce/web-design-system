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
  SurfaceContext,
} from '@/registry/ds/ui/card';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

describe('Card', () => {
  it('renders a filled card with its parts and a heading title', async () => {
    const screen = await renderWithDS(
      <Card data-testid="card">
        <CardHeader
          title="Project DOC-2048"
          description="Garden Logistics, due 14 November"
          action={<Button variant="text">Download</Button>}
        />
        <CardContent>4,820.00 USD</CardContent>
        <CardFooter>
          <Button>Send reminder</Button>
        </CardFooter>
      </Card>,
    );
    const card = screen.getByTestId('card');
    await expect.element(card).toHaveAttribute('data-slot', 'card');
    await expect.element(card).toHaveAttribute('data-variant', 'filled');
    await expect.element(card).toHaveAttribute('data-padding', 'md');
    await expect.element(card).toHaveAttribute('data-surface', 'surface-container-highest');
    await expect
      .element(screen.getByRole('heading', { level: 3, name: 'Project DOC-2048' }))
      .toBeVisible();
    await expect.element(screen.getByText('Garden Logistics, due 14 November')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Download' })).toBeVisible();
    expect(card.element().querySelector('[data-slot=card-footer]')).not.toBeNull();
  });

  it('uses the M3 resting surface for each variant and the requested heading level', async () => {
    const screen = await renderWithDS(
      <>
        <Card data-testid="elevated" variant="elevated">
          <CardTitle level={2}>Elevated</CardTitle>
        </Card>
        <Card data-testid="outlined" variant="outlined">
          <CardTitle>Outlined</CardTitle>
        </Card>
      </>,
    );
    await expect
      .element(screen.getByTestId('elevated'))
      .toHaveAttribute('data-surface', 'surface-container-low');
    await expect.element(screen.getByTestId('outlined')).toHaveAttribute('data-surface', 'surface');
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Elevated' })).toBeVisible();
  });

  it('steps nested cards up one surface level and caps at the highest', async () => {
    const screen = await renderWithDS(
      <Card data-testid="outer" variant="elevated">
        <Card data-testid="middle" variant="elevated">
          <Card data-testid="inner" variant="outlined">
            <Card data-testid="deep" variant="elevated">
              <Card data-testid="deepest" variant="elevated">
                Folder
              </Card>
            </Card>
          </Card>
          <Card data-testid="filled" variant="filled">
            Filled stays highest
          </Card>
        </Card>
      </Card>,
    );
    await expect
      .element(screen.getByTestId('outer'))
      .toHaveAttribute('data-surface', 'surface-container-low');
    await expect
      .element(screen.getByTestId('middle'))
      .toHaveAttribute('data-surface', 'surface-container');
    await expect
      .element(screen.getByTestId('inner'))
      .toHaveAttribute('data-surface', 'surface-container-high');
    await expect
      .element(screen.getByTestId('deep'))
      .toHaveAttribute('data-surface', 'surface-container-highest');
    await expect
      .element(screen.getByTestId('deepest'))
      .toHaveAttribute('data-surface', 'surface-container-highest');
    await expect
      .element(screen.getByTestId('filled'))
      .toHaveAttribute('data-surface', 'surface-container-highest');
  });

  it('starts from a surface given through SurfaceContext and honours an explicit surface', async () => {
    const screen = await renderWithDS(
      <SurfaceContext value="surface-container">
        <Card data-testid="stepped" variant="outlined">
          Region card
        </Card>
        <Card data-testid="pinned" surface="surface-container-lowest">
          Pinned card
        </Card>
      </SurfaceContext>,
    );
    await expect
      .element(screen.getByTestId('stepped'))
      .toHaveAttribute('data-surface', 'surface-container-high');
    await expect
      .element(screen.getByTestId('pinned'))
      .toHaveAttribute('data-surface', 'surface-container-lowest');
  });

  it('bleeds media to the card edges unless it is inset', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <Card data-testid="card" padding="lg">
          <CardMedia src={pixel} alt="Harbour at dawn" className="h-20" />
          <CardTitle>Lisbon offsite</CardTitle>
          <CardMedia inset src={pixel} alt="Venue floor plan" className="h-20" />
        </Card>
      </div>,
    );
    const card = screen.getByTestId('card').element();
    const bleed = screen.getByRole('img', { name: 'Harbour at dawn' }).element();
    const inset = screen.getByRole('img', { name: 'Venue floor plan' }).element();
    const cardBox = card.getBoundingClientRect();
    expect(bleed.getBoundingClientRect().width).toBeCloseTo(cardBox.width, 0);
    expect(bleed.getBoundingClientRect().top).toBeCloseTo(cardBox.top, 0);
    expect(inset.getBoundingClientRect().width).toBeCloseTo(cardBox.width - 48, 0);
    expect(inset).toHaveAttribute('data-inset', 'true');
  });
});

describe('ClickableCard', () => {
  it('renders a link named by all of its visible text, keeping the title a heading', async () => {
    const screen = await renderWithDS(
      <ClickableCard href="/reports/q3" variant="outlined">
        <CardHeader title="Q3 traffic" description="Updated 2 hours ago" />
        <CardContent>128,400 USD</CardContent>
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {
      name: /^Q3 traffic\s*Updated 2 hours ago\s*128,400 USD$/,
    });
    await expect.element(link).toHaveAttribute('href', '/reports/q3');
    await expect.element(link).toHaveAttribute('data-slot', 'clickable-card');
    await expect.element(link).not.toHaveAttribute('aria-labelledby');
    await expect.element(screen.getByRole('heading', { name: 'Q3 traffic' })).toBeVisible();
  });

  it('renders a button with phrasing content that fires onPress from mouse and keyboard', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <ClickableCard onPress={onPress}>
        <CardHeader title="Blank folder" description="Start with no accounts" />
      </ClickableCard>,
    );
    const button = screen.getByRole('button', { name: /^Blank folder\s*Start with no accounts$/ });
    expect(button.element().querySelector('h3, div, p')).toBeNull();

    await button.click();
    expect(onPress).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('prefers an explicit aria-label over the title', async () => {
    const screen = await renderWithDS(
      <ClickableCard href="/members/ayse" aria-label="Open Ayşe Demir's profile">
        <CardTitle>Ayşe Demir</CardTitle>
      </ClickableCard>,
    );
    await expect
      .element(screen.getByRole('link', { name: "Open Ayşe Demir's profile" }))
      .toBeVisible();
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

  it('says Loading while pending by default', async () => {
    const screen = await renderWithDS(
      <ClickableCard isPending>
        <CardTitle>Import CSV</CardTitle>
      </ClickableCard>,
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
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

  it('reaches the card with Tab and marks keyboard focus', async () => {
    const screen = await renderWithDS(
      <>
        <Button>Back</Button>
        <ClickableCard href="#backups">
          <CardTitle>Backups summary</CardTitle>
        </ClickableCard>
      </>,
    );
    await screen.getByRole('button', { name: 'Back' }).click();
    await userEvent.keyboard('{Tab}');
    const link = screen.getByRole('link', { name: 'Backups summary' });
    await expect.element(link).toHaveFocus();
    await expect.element(link).toHaveAttribute('data-focus-visible', 'true');
  });

  it('lets the consumer className win and accepts a render-prop className', async () => {
    const screen = await renderWithDS(
      <div className="flex w-96 flex-col items-start gap-2">
        <ClickableCard data-testid="narrow" className="w-40" onPress={() => {}}>
          <CardTitle>Blank folder</CardTitle>
        </ClickableCard>
        <ClickableCard
          data-testid="link"
          href="#vendors"
          className={({ isDisabled }) => (isDisabled ? 'opacity-50' : 'w-48')}
        >
          <CardTitle>Vendor spend</CardTitle>
        </ClickableCard>
      </div>,
    );
    expect(screen.getByTestId('narrow').element().getBoundingClientRect().width).toBe(160);
    const link = screen.getByTestId('link').element();
    expect(link.getBoundingClientRect().width).toBe(192);
    expect(link).toHaveClass('state-layer', 'focus-ring');
  });

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <ClickableCard isDisabled onPress={onPress}>
        <CardTitle>Archived folder</CardTitle>
      </ClickableCard>,
    );
    const button = screen.getByRole('button', { name: 'Archived folder' });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('SelectableCard', () => {
  it('toggles a standalone checkbox card from anywhere on the card', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCard onChange={onChange}>
        <CardHeader title="Priority support" description="Replies within 2 business hours" />
        <CardContent>19 USD a month</CardContent>
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Priority support', exact: true });
    await expect.element(checkbox).toHaveAccessibleDescription('Replies within 2 business hours');
    await expect.element(checkbox).not.toBeChecked();

    await screen.getByText('19 USD a month').click();
    await expect.element(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    const target = checkbox.element().closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-selected', 'true');

    await userEvent.keyboard(' ');
    await expect.element(checkbox).not.toBeChecked();
  });

  it('supports a controlled selection', async () => {
    function Controlled() {
      const [selected, setSelected] = useState(true);
      return (
        <>
          <SelectableCard isSelected={selected} onChange={setSelected}>
            <CardTitle>Audit log export</CardTitle>
          </SelectableCard>
          <output>{selected ? 'on' : 'off'}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Audit log export' });
    await expect.element(checkbox).toBeChecked();
    await screen.getByText('Audit log export').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('off');
  });

  it('shows the error of an invalid standalone card next to its description', async () => {
    const screen = await renderWithDS(
      <SelectableCard isInvalid errorMessage="Accept the data processing terms to continue.">
        <CardHeader title="Data processing terms" description="Version 3, effective 1 March" />
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Data processing terms' });
    await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(checkbox)
      .toHaveAccessibleDescription(
        'Accept the data processing terms to continue. Version 3, effective 1 March',
      );
    await expect
      .element(screen.getByText('Accept the data processing terms to continue.'))
      .toBeVisible();
    const target = checkbox.element().closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-invalid', 'true');
    expect(target).toHaveClass('border-error');
  });

  it('is named by all of its text, without repeating it as a description, when it has no title', async () => {
    const screen = await renderWithDS(
      <SelectableCard>
        <CardDescription>Send a copy of every project to the translator</CardDescription>
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'Send a copy of every project to the translator',
    });
    await expect.element(checkbox).not.toHaveAttribute('aria-describedby');
  });

  it('gives selectable elevated and filled cards the border width their media needs', async () => {
    const screen = await renderWithDS(
      <SelectableCard variant="filled">
        <CardTitle>Annual sharing</CardTitle>
      </SelectableCard>,
    );
    const target = screen
      .getByRole('checkbox', { name: 'Annual sharing' })
      .element()
      .closest('[data-slot=selectable-card-target]') as HTMLElement;
    expect(getComputedStyle(target).getPropertyValue('--card-border').trim()).toBe('1px');
    expect(getComputedStyle(target).borderTopWidth).toBe('1px');
  });

  it.each(['none', 'sm', 'md', 'lg'] as const)(
    'keeps the first row clear of the indicator with %s padding',
    async (padding) => {
      const screen = await renderWithDS(
        <div className="w-80">
          <SelectableCard padding={padding}>
            <CardHeader
              title="Priority support for every workspace member"
              description="Replies within 2 business hours"
            />
          </SelectableCard>
        </div>,
      );
      const target = screen
        .getByRole('checkbox', { name: /Priority support/ })
        .element()
        .closest('[data-slot=selectable-card-target]') as HTMLElement;
      const header = target.querySelector('[data-slot=card-header]') as HTMLElement;
      const indicator = target.querySelector(
        '[data-slot=selectable-card-indicator]',
      ) as HTMLElement;
      const textEnd =
        header.getBoundingClientRect().right - parseFloat(getComputedStyle(header).paddingRight);
      const gap = indicator.getBoundingClientRect().left - textEnd;
      expect(gap).toBeGreaterThanOrEqual(8);
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

  it('picks one card in a single-selection group with clicks and arrow keys', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup label="Plan" defaultValue="team" onChange={onChange}>
        <SelectableCard value="starter">
          <CardHeader title="Starter" description="One folder and one member" />
        </SelectableCard>
        <SelectableCard value="team">
          <CardHeader title="Team" description="Unlimited folders and shared reports" />
        </SelectableCard>
        <SelectableCard value="business" isDisabled>
          <CardHeader title="Business" description="Approvals, audit log and SSO" />
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByRole('radiogroup', { name: 'Plan' })).toBeVisible();
    const team = screen.getByRole('radio', { name: 'Team', exact: true });
    await expect.element(team).toBeChecked();
    await expect.element(team).toHaveAccessibleDescription('Unlimited folders and shared reports');

    await screen.getByText('One folder and one member').click();
    expect(onChange).toHaveBeenLastCalledWith('starter');
    await expect.element(screen.getByRole('radio', { name: 'Starter' })).toBeChecked();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(team).toBeChecked();
    await expect.element(screen.getByRole('radio', { name: 'Business' })).toBeDisabled();
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

  it('enters the group on the selected card with Tab and marks keyboard focus', async () => {
    const screen = await renderWithDS(
      <>
        <Button>Back</Button>
        <SelectableCardGroup label="Plan" defaultValue="team">
          <SelectableCard value="starter">
            <CardTitle>Starter</CardTitle>
          </SelectableCard>
          <SelectableCard value="team">
            <CardTitle>Team</CardTitle>
          </SelectableCard>
        </SelectableCardGroup>
      </>,
    );
    await screen.getByRole('button', { name: 'Back' }).click();
    await userEvent.keyboard('{Tab}');
    const team = screen.getByRole('radio', { name: 'Team' });
    await expect.element(team).toHaveFocus();
    expect(team.element().closest('[data-slot=selectable-card-target]')).toHaveAttribute(
      'data-focus-visible',
      'true',
    );
  });

  it('disables every card in a disabled group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup selectionMode="multiple" label="Exports" isDisabled onChange={onChange}>
        <SelectableCard value="csv">
          <CardTitle>CSV</CardTitle>
        </SelectableCard>
        <SelectableCard value="xlsx">
          <CardTitle>Excel</CardTitle>
        </SelectableCard>
      </SelectableCardGroup>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'CSV' })).toBeDisabled();
    await expect.element(screen.getByRole('checkbox', { name: 'Excel' })).toBeDisabled();
    await screen.getByText('CSV').click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole('group', { name: 'Exports' }))
      .toHaveAttribute('data-disabled', 'true');
    const target = screen
      .getByRole('checkbox', { name: 'CSV' })
      .element()
      .closest('[data-slot=selectable-card-target]');
    expect(target).toHaveAttribute('data-disabled', 'true');
    expect(target).toHaveClass('text-on-surface/38');
  });

  it('collects several values in a multiple-selection group', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <SelectableCardGroup
        selectionMode="multiple"
        label="Notify me about"
        defaultValue={['projects']}
        onChange={onChange}
        orientation="horizontal"
      >
        <SelectableCard value="projects">
          <CardTitle>Overdue projects</CardTitle>
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
          {(['elevated', 'filled', 'outlined'] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardMedia src={pixel} alt="" className="h-12" />
              <CardHeader title={`${variant} card`} description="Supporting text for the card" />
              <CardContent>
                <Card variant="elevated">
                  <CardDescription>Nested card text</CardDescription>
                </Card>
              </CardContent>
              <CardFooter>
                <Button variant="text">Details</Button>
              </CardFooter>
            </Card>
          ))}
          <ClickableCard href="/reports/q3">
            <CardHeader title="Q3 traffic" description="Updated 2 hours ago" />
          </ClickableCard>
          <ClickableCard onPress={() => {}} isDisabled>
            <CardHeader title="Archived" description="Read only" />
          </ClickableCard>
          <SelectableCardGroup label="Plan" defaultValue="team" orientation="horizontal">
            <SelectableCard value="starter">
              <CardHeader title="Starter" description="One folder" />
            </SelectableCard>
            <SelectableCard value="team" variant="elevated">
              <CardHeader title="Team" description="Shared reports" />
            </SelectableCard>
            <SelectableCard value="business" isDisabled variant="filled">
              <CardHeader title="Business" description="Approvals and SSO" />
            </SelectableCard>
          </SelectableCardGroup>
          <SelectableCard defaultSelected>
            <CardHeader title="Priority support" description="Replies within 2 hours" />
          </SelectableCard>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
