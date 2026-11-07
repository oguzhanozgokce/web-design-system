'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'react-aria-components';
import { RefreshIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';

interface RecentFile {
  id: string;
  name: string;
  kind: string;
  size: number;
}

const recentFiles: RecentFile[] = [
  { id: 'brief', name: 'Project brief.pdf', kind: 'PDF document', size: 2.4 },
  { id: 'photo', name: 'Team photo.jpg', kind: 'JPEG image', size: 5.1 },
  { id: 'notes', name: 'Meeting notes.txt', kind: 'Plain text', size: 0.1 },
];

function fetchFiles(shouldFail: boolean) {
  return new Promise<RecentFile[]>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Request timed out'));
      else resolve(recentFiles);
    }, 1200);
  });
}

export default function ContentStateDemo() {
  const { locale } = useLocale();
  const megabytes = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  });
  const [data, setData] = useState<RecentFile[]>();
  const [error, setError] = useState<unknown>();
  const [isRefreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFiles(true).then(setData, setError);
  }, []);

  async function load() {
    try {
      setData(await fetchFiles(false));
      setError(undefined);
    } catch (reason) {
      setError(reason);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <section className="w-full max-w-lg rounded-container border border-outline-subtle bg-surface-raised">
      <div className="flex items-center justify-between gap-2 border-b border-outline-subtle py-2 ps-4 pe-2">
        <h3 className="text-sm font-semibold text-on-surface">Recent files</h3>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<RefreshIcon />}
          isDisabled={data === undefined}
          onPress={refresh}
        >
          Refresh
        </Button>
      </div>
      <ContentState
        data={data}
        error={error}
        isRefreshing={isRefreshing}
        onRetry={load}
        headingLevel={4}
        loadingLabel="Loading files"
        className="p-2"
      >
        {(items) => (
          <ul className="flex flex-col">
            {items.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-4 px-2 py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">{file.kind}</p>
                </div>
                <span className="text-sm text-on-surface tabular-digits">
                  {megabytes.format(file.size)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ContentState>
    </section>
  );
}
