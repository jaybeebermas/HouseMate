export interface NavigationItem {
  id: string;
  title: string;
  type: 'group' | 'collapsible' | 'item' | string;
  icon?: string | null;
  route?: string | null;
  permission?: string | null;
  parent?: string | null;
  children: NavigationItem[];
}
