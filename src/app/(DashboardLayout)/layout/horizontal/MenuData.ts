import SidebarContent, { ChildItem } from '@/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems';
import { uniqueId } from 'lodash';

export interface HorizontalMenuItem {
  id: string;
  title: string;
  icon?: string;
  href: string;
  permission?: string;
  column?: number;
  children?: HorizontalMenuItem[];
}

const toMenuItem = (child: ChildItem): HorizontalMenuItem => ({
  id: String(child.id ?? uniqueId()),
  title: child.name ?? '',
  icon: child.icon,
  href: child.url ?? '',
  permission: child.permission,
  children: child.children?.map(toMenuItem),
});

// The same pages as the vertical sidebar, one dropdown per section.
const Menuitems: HorizontalMenuItem[] = (SidebarContent[0]?.items ?? []).map((section) => ({
  id: uniqueId(),
  title: section.heading ?? '',
  icon: 'solar:layers-line-duotone',
  href: '',
  column: 4,
  children: (section.children ?? []).map(toMenuItem),
}));

export default Menuitems;
