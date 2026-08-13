export interface TableHeaderOption {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: string;
  width?: string;
  showInReadOnly?: boolean;
}
