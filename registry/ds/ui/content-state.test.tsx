import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { ContentState, type ContentStatus } from '@/registry/ds/ui/content-state';

interface Project {
  id: string;
  owner: string;
}

const projects: Project[] = [
  { id: 'Garden', owner: 'Alex' },
  { id: 'Kitchen', owner: 'Jonas' },
];

function ProjectList({ items }: { items: Project[] }) {
  return (
    <ul aria-label="Projects">
      {items.map((project) => (
        <li key={project.id}>
          {project.id} · {project.owner}
        </li>
      ))}
    </ul>
  );
}

function root(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="content-state"]')!;
}

describe('ContentState', () => {
  it('shows a labelled progress bar and marks the region busy while data is undefined', async () => {
    const screen = await renderWithDS(
      <ContentState<Project[]> data={undefined} loadingLabel="Loading projects">
        {(items) => <ProjectList items={items} />}
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading projects' }))
      .toBeInTheDocument();
    expect(root(screen.container).getAttribute('aria-busy')).toBe('true');
    expect(root(screen.container).getAttribute('data-status')).toBe('loading');
  });

  it('passes loaded data to a render function', async () => {
    const screen = await renderWithDS(
      <ContentState data={projects}>{(items) => <ProjectList items={items} />}</ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Projects' })).toBeVisible();
    await expect.element(screen.getByText('Kitchen · Jonas')).toBeVisible();
  });

  it('respects a custom isEmpty and empty copy', async () => {
    const screen = await renderWithDS(
      <ContentState
        data={{ total: 0, rows: [] as Project[] }}
        isEmpty={(page) => page.total === 0}
        emptyTitle="No projects yet"
        emptyDescription="Projects you create appear here."
        emptyAction={<Button>New project</Button>}
      >
        {(page) => <ProjectList items={page.rows} />}
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'No projects yet' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument();
  });

  it('sizes the loading spinner at 24, 32 and 40 pixels', async () => {
    const sizes = { sm: 24, md: 32, lg: 40 } as const;
    const screen = await renderWithDS(
      <>
        {Object.keys(sizes).map((size) => (
          <ContentState key={size} status="loading" size={size as keyof typeof sizes} />
        ))}
      </>,
    );
    const regions = screen.container.querySelectorAll<HTMLElement>('[data-slot="content-state"]');
    expect(
      [...regions].map((region) => [
        region.getAttribute('data-size'),
        region.querySelector('[data-slot="spinner"]')!.getBoundingClientRect().width,
      ]),
    ).toEqual(Object.entries(sizes));
  });

  it('shows an alert with a retry', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <ContentState data={undefined} error={new Error('timeout')} onRetry={onRetry}>
        content
      </ContentState>,
    );
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Something went wrongPlease try again in a moment.Try again');
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('builds error copy from the error and hides retry without onRetry', async () => {
    const screen = await renderWithDS(
      <ContentState
        status="error"
        error={{ status: 403 }}
        errorTitle={(error) =>
          (error as { status: number }).status === 403 ? 'You do not have access' : 'Failed'
        }
        errorDescription="Ask a workspace owner to add you to Sharing."
      />,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'You do not have access' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
  });

  it('keeps stale content and shows a refresh error banner when data and error coexist', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <ContentState data={projects} error={new Error('offline')} onRetry={onRetry}>
        {(items) => <ProjectList items={items} />}
      </ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Projects' })).toBeVisible();
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Error: Something went wrongPlease try again in a moment.');
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('follows an explicit status and renders custom slots', async () => {
    function Harness() {
      const [status, setStatus] = useState<ContentStatus>('loading');
      return (
        <>
          {(['loading', 'error', 'empty', 'content'] as const).map((next) => (
            <Button key={next} onPress={() => setStatus(next)}>
              Show {next}
            </Button>
          ))}
          <ContentState
            status={status}
            loadingContent={<div data-testid="skeleton" />}
            errorContent={(error, retry) => <p>Custom error {String(Boolean(retry))}</p>}
            emptyContent={<p>Custom empty</p>}
          >
            <p>Folder rows</p>
          </ContentState>
        </>
      );
    }
    const screen = await renderWithDS(<Harness />);
    await expect.element(screen.getByTestId('skeleton')).toBeInTheDocument();
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await screen.getByRole('button', { name: 'Show error' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Custom error false');

    await screen.getByRole('button', { name: 'Show empty' }).click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('Custom empty');

    await screen.getByRole('button', { name: 'Show content' }).click();
    await expect.element(screen.getByText('Folder rows')).toBeVisible();
  });

  it('moves focus to the region when the focused content or error view goes away', async () => {
    function Harness() {
      const [status, setStatus] = useState<ContentStatus>('content');
      return (
        <>
          <Button onPress={() => setStatus('error')}>Fail</Button>
          <ContentState status={status} onRetry={() => setStatus('loading')}>
            <Button onPress={() => setStatus('loading')}>Reload folder</Button>
          </ContentState>
        </>
      );
    }
    const screen = await renderWithDS(<Harness />);
    await userEvent.keyboard('{Tab}{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Reload folder' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(document.activeElement).toBe(root(screen.container));
    await userEvent.keyboard('{Tab}');
    expect(root(screen.container).hasAttribute('tabindex')).toBe(false);

    await screen.getByRole('button', { name: 'Fail' }).click();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Try again' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(document.activeElement).toBe(root(screen.container));
  });

  it('keeps content visible and marks the region busy while refreshing', async () => {
    const screen = await renderWithDS(
      <ContentState data={projects} isRefreshing>
        {(items) => <ProjectList items={items} />}
      </ContentState>,
    );
    await expect.element(screen.getByRole('list', { name: 'Projects' })).toBeVisible();
    const element = root(screen.container);
    expect(element.getAttribute('aria-busy')).toBe('true');
    expect(element.getAttribute('data-refreshing')).toBe('true');
    expect(element.getAttribute('data-status')).toBe('content');
  });

  it('treats null and an empty array as empty and shows the error when empty data comes with an error', async () => {
    const screen = await renderWithDS(
      <>
        <ContentState data={null} data-testid="empty" />
        <ContentState data={[] as Project[]} data-testid="list" />
        <ContentState data={[]} error={new Error('timeout')} data-testid="failed" />
      </>,
    );
    await expect.element(screen.getByTestId('empty')).toHaveAttribute('data-status', 'empty');
    await expect.element(screen.getByTestId('failed')).toHaveAttribute('data-status', 'error');
    await expect
      .element(screen.getByTestId('list').getByRole('heading', { name: 'Nothing here yet' }))
      .toBeInTheDocument();
    expect(screen.getByTestId('list').element().hasAttribute('aria-busy')).toBe(false);
    await expect.element(screen.getByRole('alert')).toMatchTextContent(/^Something went wrong/);
  });

  it('takes its copy from props, then labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <ContentState
          status="error"
          onRetry={() => {}}
          labels={{ errorTitle: 'Files could not be loaded' }}
        />
        <ContentState status="empty" labels={{ emptyTitle: 'No files have been added' }} />
        <ContentState status="loading" />
        <ContentState
          status="loading"
          loadingLabel="Loading contacts"
          labels={{ loading: 'Waiting for data' }}
        />
      </div>,
      {
        provider: {
          labels: {
            contentState: {
              errorTitle: 'Something failed',
              errorDescription: 'Please try again shortly.',
              retry: 'Tekrar dene',
              loading: 'Working',
            },
          },
        },
      },
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Files could not be loaded' }))
      .toBeInTheDocument();
    await expect.element(screen.getByText('Please try again shortly.')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('heading', { name: 'No files have been added' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('progressbar', { name: 'Working' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading contacts' }))
      .toBeInTheDocument();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <ContentState status="loading" size="sm" />
          <ContentState status="error" headingLevel={3} onRetry={() => {}} />
          <ContentState status="empty" size="sm" headingLevel={3} />
          <ContentState data={projects} error={new Error('offline')} onRetry={() => {}}>
            {(items) => <ProjectList items={items} />}
          </ContentState>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
