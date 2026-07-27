export interface SubMenuItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
  badge?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: SubMenuItem[];
  badge?: string;
  expanded?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}

export interface ShortcutItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  category: string;
}
