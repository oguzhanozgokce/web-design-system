import { filterGallery } from '@/lib/gallery-search';

it('matches category names, titles and descriptions while keeping the selected category filter', () => {
  const button = {
    name: 'button',
    title: 'Button',
    description: 'An action',
    category: 'actions',
    href: '/button',
  };
  const sparkline = {
    name: 'sparkline',
    title: 'Sparkline',
    description: 'A small trend',
    category: 'charts',
    href: '/sparkline',
  };
  const entries = [button, sparkline];
  const categories = [
    { id: 'actions', label: 'Actions' },
    { id: 'charts', label: 'Charts' },
  ];

  expect(filterGallery(entries, categories, 'all', ' CHARTS ')).toEqual([sparkline]);
  expect(filterGallery(entries, categories, 'all', 'button')).toEqual([button]);
  expect(filterGallery(entries, categories, 'all', 'trend')).toEqual([sparkline]);
  expect(filterGallery(entries, categories, 'actions', 'charts')).toEqual([]);
  expect(filterGallery(entries, categories, 'all', '')).toEqual(entries);
});
