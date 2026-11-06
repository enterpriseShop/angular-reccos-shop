export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system';
export type NotificationCategory =
  'estoque' | 'importacao' | 'catalogo' | 'compatibilidade' | 'veiculos' | 'sistema';
export type NotificationPriority = 'alta' | 'media' | 'baixa';
export type NotificationReadFilter = 'all' | 'unread' | 'read';

export interface NotificationRelatedEntity {
  module: string; // e.g. 'Estoque', 'Produtos', 'Importações', 'OEM'
  entityId?: string; // e.g. 'PROD-CT1028', 'IMP-8820'
  route: string; // e.g. '/commercial/inventory', '/catalog/products'
  label: string; // e.g. 'Ver Item no Estoque'
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  fullMessage?: string;
  timestamp: string; // Human readable date string, e.g. 'Hoje às 14:32'
  createdAt: string; // ISO Date string for sorting
  read: boolean;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  link?: string;
  relatedEntity?: NotificationRelatedEntity;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  highPriority: number;
}
