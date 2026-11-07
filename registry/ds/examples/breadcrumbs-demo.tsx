import { Breadcrumb, Breadcrumbs } from '@/registry/ds/ui/breadcrumbs';

export default function BreadcrumbsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/docs">Components</Breadcrumb>
      <Breadcrumb>Breadcrumbs</Breadcrumb>
    </Breadcrumbs>
  );
}
