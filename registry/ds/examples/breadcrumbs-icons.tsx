import { FolderIcon, HomeIcon } from '@/registry/ds/lib/icons';
import { Breadcrumb, Breadcrumbs } from '@/registry/ds/ui/breadcrumbs';

export default function BreadcrumbsIcons() {
  return (
    <Breadcrumbs aria-label="Project path">
      <Breadcrumb href="#usage">
        <HomeIcon />
        Workspace
      </Breadcrumb>
      <Breadcrumb href="#usage">
        <FolderIcon />
        Projects
      </Breadcrumb>
      <Breadcrumb>Website redesign</Breadcrumb>
    </Breadcrumbs>
  );
}
