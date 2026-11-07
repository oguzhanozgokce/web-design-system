import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GroupIcon } from '@/registry/ds/lib/icons';
import { Avatar, AvatarButton, AvatarGroup, getAvatarInitials } from '@/registry/ds/ui/avatar';
import { Menu, MenuItem, MenuTrigger } from '@/registry/ds/ui/menu';

const photo = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8'/></svg>",
)}`;
const brokenPhoto = 'data:image/png;base64,AAAA';

async function settleAnimations() {
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

function centerX(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function probe(className: string, property: 'backgroundColor' | 'color' = 'backgroundColor') {
  const element = document.createElement('span');
  element.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(element);
  const value = getComputedStyle(element)[property];
  element.remove();
  return value;
}

function visualOf(root: Element) {
  return root.querySelector('[data-slot="avatar-visual"]')!;
}

describe('getAvatarInitials', () => {
  it('takes the first and last word', () => {
    expect(getAvatarInitials('Alex Taylor Morgan')).toBe('AM');
    expect(getAvatarInitials('  morgan   king ')).toBe('MK');
    expect(getAvatarInitials('Madonna')).toBe('M');
  });

  it('skips words that do not start with a letter or digit', () => {
    expect(getAvatarInitials('Emma Shaw (Design)')).toBe('ES');
    expect(getAvatarInitials('@drew')).toBe('D');
    expect(getAvatarInitials('🦊')).toBe('');
  });

  it('takes the first grapheme for scripts without initials', () => {
    expect(getAvatarInitials('李小龙')).toBe('李');
    expect(getAvatarInitials('山田 太郎')).toBe('山');
    expect(getAvatarInitials('محمد علي')).toBe('م');
    expect(getAvatarInitials('क्षमा शर्मा')).toBe('क्ष');
    expect(getAvatarInitials('Наталья Петрова')).toBe('НП');
  });
});

describe('Avatar', () => {
  it('shows initials and is named after the person', async () => {
    const screen = await renderWithDS(<Avatar name="Alex Morgan" />);
    const image = screen.getByRole('img', { name: 'Alex Morgan' });
    await expect.element(image).toHaveTextContent('AM');
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-shape', 'circle');
    expect(root).toHaveAttribute('data-tone', 'neutral');
  });

  it('paints the fallback with the soft role of its tone and the matching on-role', async () => {
    const roles = {
      neutral: ['bg-neutral-soft', 'text-on-surface'],
      primary: ['bg-primary-soft', 'text-on-primary-soft'],
      success: ['bg-success-soft', 'text-on-success-soft'],
      warning: ['bg-warning-soft', 'text-on-warning-soft'],
      error: ['bg-error-soft', 'text-on-error-soft'],
      info: ['bg-info-soft', 'text-on-info-soft'],
    } as const;
    const screen = await renderWithDS(
      <>
        <Avatar name="Alex Morgan" data-testid="neutral" />
        {(['primary', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
          <Avatar key={tone} name="Alex Morgan" tone={tone} data-testid={tone} />
        ))}
      </>,
    );
    for (const [tone, [background, color]] of Object.entries(roles)) {
      const root = screen.getByTestId(tone).element();
      expect(root).toHaveAttribute('data-tone', tone);
      const style = getComputedStyle(visualOf(root));
      expect(style.backgroundColor).toBe(probe(background));
      expect(style.color).toBe(probe(color, 'color'));
    }
  });

  it('sizes the avatar at 24, 32, 40, 48 and 64px with matching initials and corner radius', async () => {
    const sizes = {
      xs: [24, 12, 8],
      sm: [32, 12, 8],
      md: [40, 14, 12],
      lg: [48, 16, 12],
      xl: [64, 20, 12],
    };
    const screen = await renderWithDS(
      <>
        {Object.keys(sizes).map((size) => (
          <Avatar
            key={size}
            name="Alex Morgan"
            size={size as keyof typeof sizes}
            shape="rounded"
            data-testid={size}
          />
        ))}
      </>,
    );
    for (const [size, [box, font, radius]] of Object.entries(sizes)) {
      const root = screen.getByTestId(size).element();
      expect(root.getBoundingClientRect().width).toBe(box);
      expect(root.getBoundingClientRect().height).toBe(box);
      expect(getComputedStyle(visualOf(root)).fontSize).toBe(`${font}px`);
      expect(getComputedStyle(visualOf(root)).borderTopLeftRadius).toBe(`${radius}px`);
    }
  });

  it('uppercases initials in the current locale', async () => {
    const screen = await renderWithDS(<Avatar name={'ilkay \u015fahin'} />, { locale: 'tr' });
    await expect
      .element(screen.getByRole('img', { name: 'ilkay \u015fahin' }))
      .toHaveTextContent('\u0130\u015e');
  });

  it('shows the photo once it loads', async () => {
    const screen = await renderWithDS(<Avatar name="Alex Morgan" src={photo} />);
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('loaded');
    expect(root.querySelector('img')).toHaveAttribute('data-loaded');
    expect(root.querySelector('[data-slot="avatar-initials"]')).toBeNull();
    await expect.element(screen.getByRole('img', { name: 'Alex Morgan' })).toBeVisible();
  });

  it('falls back to initials when the photo fails', async () => {
    const onError = vi.fn();
    const screen = await renderWithDS(
      <Avatar name="Morgan King" src={brokenPhoto} imageProps={{ onError }} />,
    );
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('error');
    expect(root.querySelector('img')).toBeNull();
    await expect.element(screen.getByRole('img', { name: 'Morgan King' })).toHaveTextContent('MK');
    expect(onError).toHaveBeenCalledOnce();
  });

  it('starts loading again when src changes', async () => {
    function ProfilePhoto() {
      const [src, setSrc] = useState(brokenPhoto);
      return (
        <>
          <Avatar name="Morgan King" src={src} />
          <button type="button" onClick={() => setSrc(photo)}>
            Upload photo
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<ProfilePhoto />);
    const root = screen.container.querySelector('[data-slot="avatar"]')!;
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('error');
    await screen.getByRole('button', { name: 'Upload photo' }).click();
    await expect.poll(() => root.getAttribute('data-image-state')).toBe('loaded');
    expect(screen.container.querySelector('[data-slot="avatar"]')).toBe(root);
  });

  it('shows the person glyph without a name, hidden unless alt names it', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar data-testid="unnamed" />
        <Avatar alt="Design team" fallbackIcon={<span data-testid="custom-icon" />} />
      </>,
    );
    const unnamed = screen.getByTestId('unnamed').element();
    expect(unnamed).toHaveAttribute('aria-hidden', 'true');
    expect(unnamed).toHaveAttribute('data-tone', 'neutral');
    expect(unnamed.querySelector('[data-slot="avatar-icon"] svg')).not.toBeNull();
    const named = screen.getByRole('img', { name: 'Design team' });
    await expect.element(named).toBeVisible();
    expect(named.element().querySelector('[data-slot="avatar-icon"] svg')).toBeNull();
    await expect.element(named.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('is decorative with an empty alt but keeps its status announced', async () => {
    const screen = await renderWithDS(
      <>
        <p>
          <Avatar name="Alex Morgan" alt="" size="xs" data-testid="plain" /> Alex Morgan
        </p>
        <p>
          <Avatar name="Alex Morgan" alt="" status="busy" data-testid="busy" /> Alex Morgan
        </p>
      </>,
    );
    expect(screen.getByTestId('plain').element()).toHaveAttribute('aria-hidden', 'true');
    const root = screen.getByTestId('busy').element();
    expect(root).not.toHaveAttribute('aria-hidden');
    expect(root.querySelector('[data-slot="avatar-visual"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.container.querySelectorAll('[role="img"]')).toHaveLength(0);
    await expect.element(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('takes its name from aria-labelledby', async () => {
    const screen = await renderWithDS(
      <figure>
        <Avatar name="Alex Morgan" aria-labelledby="owner-caption" />
        <figcaption id="owner-caption">Workspace owner</figcaption>
      </figure>,
    );
    await expect.element(screen.getByRole('img', { name: 'Workspace owner' })).toBeVisible();
    expect(screen.container.querySelector('[data-slot="avatar"]')).not.toHaveAttribute(
      'aria-labelledby',
    );
  });

  it('puts the status dot at the bottom-end corner in both directions', async () => {
    for (const locale of ['en', 'ar']) {
      for (const shape of ['circle', 'rounded'] as const) {
        const screen = await renderWithDS(
          <Avatar name="Alex Morgan" size="xl" shape={shape} status="online" />,
          { locale },
        );
        const root = screen.container.querySelector('[data-slot="avatar"]')!;
        const dot = root.querySelector('[data-slot="avatar-status"]')!;
        const isEndRight = locale === 'en';
        expect(centerX(dot) > centerX(root)).toBe(isEndRight);
        expect(dot.getBoundingClientRect().bottom).toBeGreaterThan(
          root.getBoundingClientRect().top + root.getBoundingClientRect().height * 0.75,
        );
        await screen.unmount();
      }
    }
  });

  it('cuts the status dot out with the canvas, or the colour a container sets', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Alex Morgan" status="online" data-testid="page" />
        <div className="bg-surface-raised [--ds-avatar-ring:var(--surface-raised)]">
          <Avatar name="Morgan King" status="online" data-testid="card" />
        </div>
      </>,
    );
    const ring = (id: string) =>
      getComputedStyle(
        screen.getByTestId(id).element().querySelector('[data-slot="avatar-status"]')!,
      ).boxShadow;
    expect(ring('page')).toContain(probe('bg-canvas'));
    expect(ring('card')).toContain(probe('bg-surface-raised'));
  });

  it('takes the status text from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <Avatar name="Alex Morgan" status="online" />
        <Avatar name="Morgan King" status="busy" labels={{ busy: 'In a meeting until 14:00' }} />
        <AvatarButton name="Emma Shaw" status="away" labels={{ away: 'Back at 15:00' }} />
        <Avatar name="Chris Wilson" status="offline" />
      </>,
      { provider: { labels: { avatar: { online: 'Available', busy: 'In a meeting' } } } },
    );
    await expect.element(screen.getByText('Available', { exact: true })).toBeInTheDocument();
    await expect
      .element(screen.getByText('In a meeting until 14:00', { exact: true }))
      .toBeInTheDocument();
    await expect.element(screen.getByText('In a meeting', { exact: true })).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Emma Shaw Back at 15:00' }))
      .toBeVisible();
    await expect.element(screen.getByText('Offline', { exact: true })).toBeInTheDocument();
  });
});

describe('AvatarButton', () => {
  it('is a button named after the person and fires onPress', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AvatarButton name="Alex Morgan" status="away" onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Alex Morgan Away' });
    await button.click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('opens a menu as its trigger', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <MenuTrigger>
        <AvatarButton name="Alex Morgan" aria-label="Account" />
        <Menu onAction={onAction}>
          <MenuItem id="profile">Profile</MenuItem>
          <MenuItem id="sign-out">Sign out</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Account' });
    await trigger.click();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction.mock.calls[0][0]).toBe('sign-out');
    await expect.element(trigger).toHaveFocus();
  });
});

describe('AvatarGroup', () => {
  const team = [
    'Alex Morgan',
    'Morgan King',
    'Emma Shaw',
    'Chris Wilson',
    'Zeynep Arslan',
    'Evan Clark',
  ];

  it('shows max avatars and a labelled overflow avatar', async () => {
    const screen = await renderWithDS(
      <AvatarGroup aria-label="Project approvers" max={3}>
        {team.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Project approvers' });
    await expect.element(group).toBeVisible();
    expect(group.element().querySelectorAll('[data-slot="avatar-group-item"]')).toHaveLength(4);
    await expect.element(screen.getByRole('img', { name: 'Alex Morgan' })).toBeVisible();
    await expect.element(screen.getByRole('img', { name: 'Chris Wilson' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('img', { name: '3 more' })).toHaveTextContent('+3');
  });

  it('overlaps each avatar by a quarter of its size and seams it with a ring', async () => {
    const screen = await renderWithDS(
      <AvatarGroup aria-label="Team" size="md">
        <Avatar name="Alex Morgan" />
        <Avatar name="Morgan King" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Team' }).element();
    expect(group).toHaveAttribute('data-seam', 'ring');
    const [first, second] = group.querySelectorAll('[data-slot="avatar-group-item"]');
    expect(second.getBoundingClientRect().left - first.getBoundingClientRect().left).toBeCloseTo(
      30,
      0,
    );
    expect(getComputedStyle(first).boxShadow).toContain(probe('bg-canvas'));
    expect(getComputedStyle(second).backgroundColor).toBe(probe('bg-canvas'));
    expect(getComputedStyle(first).maskImage).toBe('none');
  });

  it('cuts a transparent seam with a mask when seam is clip', async () => {
    for (const shape of ['circle', 'rounded'] as const) {
      const screen = await renderWithDS(
        <AvatarGroup aria-label="Team" size="md" shape={shape} seam="clip" max={2}>
          <Avatar name="Alex Morgan" />
          <Avatar name="Morgan King" />
          <Avatar name="Emma Shaw" />
        </AvatarGroup>,
      );
      const group = screen.getByRole('group', { name: 'Team' }).element();
      expect(group).toHaveAttribute('data-seam', 'clip');
      const items = [...group.querySelectorAll('[data-slot="avatar-group-item"]')];
      expect(items).toHaveLength(3);
      const gradient = shape === 'circle' ? 'radial-gradient' : 'linear-gradient';
      for (const item of items.slice(0, -1)) {
        expect(getComputedStyle(item).maskImage).toContain(gradient);
        expect(getComputedStyle(item).boxShadow).toBe('none');
      }
      expect(getComputedStyle(items.at(-1)!).maskImage).toBe('none');
      await screen.unmount();
    }
  });

  it('lifts the mask off a focused avatar so its focus ring shows', async () => {
    const screen = await renderWithDS(
      <>
        <button type="button">Before</button>
        <AvatarGroup aria-label="Assign to" seam="clip">
          <AvatarButton name="Alex Morgan" />
          <AvatarButton name="Morgan King" />
        </AvatarGroup>
      </>,
    );
    await screen.getByRole('button', { name: 'Before' }).click();
    await userEvent.keyboard('{Tab}');
    const first = screen.getByRole('button', { name: 'Alex Morgan' });
    await expect.element(first).toHaveFocus();
    const item = first.element().closest('[data-slot="avatar-group-item"]')!;
    expect(getComputedStyle(item).maskImage).toBe('none');
    expect(Number(getComputedStyle(item).zIndex)).toBeGreaterThan(0);
  });

  it('passes its size and shape to every avatar', async () => {
    const screen = await renderWithDS(
      <AvatarGroup size="lg" shape="rounded">
        <Avatar name="Alex Morgan" />
        <Avatar name="Morgan King" />
      </AvatarGroup>,
    );
    for (const avatar of screen.container.querySelectorAll('[data-slot="avatar"]')) {
      expect(avatar).toHaveAttribute('data-size', 'lg');
      expect(avatar).toHaveAttribute('data-shape', 'rounded');
    }
    expect(screen.container.querySelector('[data-slot="avatar-overflow"]')).toBeNull();
  });

  it('shows no overflow avatar when everyone fits', async () => {
    const screen = await renderWithDS(
      <AvatarGroup max={4} total={2}>
        <Avatar name="Alex Morgan" />
        <Avatar name="Morgan King" />
        <Avatar name="Emma Shaw" />
      </AvatarGroup>,
    );
    expect(screen.container.querySelectorAll('[data-slot="avatar-group-item"]')).toHaveLength(3);
    expect(screen.container.querySelector('[data-slot="avatar-overflow"]')).toBeNull();
  });

  it('stacks from the start edge in both directions', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(
        <AvatarGroup max={2}>
          <Avatar name="Alex Morgan" />
          <Avatar name="Morgan King" />
          <Avatar name="Emma Shaw" />
        </AvatarGroup>,
        { locale },
      );
      const [first, second, overflow] = screen.container.querySelectorAll(
        '[data-slot="avatar-group-item"]',
      );
      const forward = locale === 'en' ? 1 : -1;
      expect(Math.sign(centerX(second) - centerX(first))).toBe(forward);
      expect(Math.sign(centerX(overflow) - centerX(second))).toBe(forward);
      expect(Math.abs(centerX(second) - centerX(first))).toBeLessThan(
        (first as HTMLElement).offsetWidth,
      );
      expect(overflow.querySelector('[data-slot="avatar"]')).toHaveAttribute(
        'data-tone',
        'neutral',
      );
      await screen.unmount();
    }
  });

  it('takes the overflow text from labels, then DSProvider, then the English default', async () => {
    const english = await renderWithDS(
      <AvatarGroup total={1284} max={2}>
        <Avatar name="Alex Morgan" />
        <Avatar name="Morgan King" />
      </AvatarGroup>,
    );
    await expect.element(english.getByRole('img', { name: '1,282 more' })).toHaveTextContent('99+');
    await english.unmount();

    const screen = await renderWithDS(
      <>
        <AvatarGroup
          aria-label="Project approvers"
          max={1}
          labels={{ more: ({ count }) => `${count} more approvers` }}
        >
          <Avatar name="Alex Morgan" />
          <Avatar name="Morgan King" />
          <Avatar name="Emma Shaw" />
        </AvatarGroup>
        <AvatarGroup aria-label="Members of #general" total={1284} max={1}>
          <Avatar name="Zeynep Arslan" />
        </AvatarGroup>
        <AvatarGroup aria-label="Reviewers" max={1} labels={{ more: '{count} more' }}>
          <Avatar name="Chris Wilson" />
          <Avatar name="Evan Clark" />
        </AvatarGroup>
      </>,
      {
        provider: { labels: { avatar: { more: 'Another {count} people', overflowCap: '+{max}' } } },
      },
    );
    await expect
      .element(screen.getByRole('img', { name: '2 more approvers' }))
      .toHaveTextContent('+2');
    await expect
      .element(screen.getByRole('img', { name: 'Another 1,283 people' }))
      .toHaveTextContent('+99');
    await expect.element(screen.getByRole('img', { name: '1 more' })).toHaveTextContent('+1');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Avatar key={size} name="Alex Morgan" size={size} />
            ))}
            <Avatar name="Morgan King" shape="rounded" status="busy" />
            <Avatar name="Evan Clark" status="away" />
            {(['primary', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
              <Avatar key={tone} name="Emma Shaw" tone={tone} />
            ))}
            <Avatar name="Emma Shaw" status="online" shape="rounded" size="xs" />
            <Avatar name="Chris Wilson" tone="neutral" status="offline" />
            <Avatar alt="Design team" fallbackIcon={<GroupIcon />} />
            <Avatar name="Zeynep Arslan" src={photo} />
            <Avatar name="Sam Adams" alt="" status="away" />
            <AvatarButton name="Alex Morgan" status="online" />
            <AvatarButton name="Blake Oliver" isDisabled />
          </div>
          <AvatarGroup aria-label="Project approvers" max={3} size="md">
            {team.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
          <AvatarGroup aria-label="Reviewers" max={2} size="xs" seam="clip">
            {team.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
        </div>,
        options,
      );
      await settleAnimations();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
