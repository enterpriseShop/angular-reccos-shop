export type ColumnAlign = 'left' | 'center' | 'right';
export type ColumnType = 'text' | 'badge' | 'currency' | 'date' | 'boolean' | 'custom' | 'icon';

export interface TableBadgeConfig {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'draft';
  color?: string;
  icon?: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  align?: ColumnAlign;
  type?: ColumnType;
  sortable?: boolean;
  valueGetter?: (row: T) => unknown;
  cellFormatter?: (row: T) => string | number | boolean | null | undefined;
  badgeConfig?: (row: T) => TableBadgeConfig;
  iconGetter?: (row: T) => string;
}

export interface TableAction<T = Record<string, unknown>> {
  id: string;
  label: string;
  icon: string;
  colorClass?: string;
  title?: string;
  visible?: (row: T) => boolean;
  handler: (row: T) => void;
}

export interface TablePaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
}
