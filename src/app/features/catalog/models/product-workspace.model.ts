export type ProductWorkspaceMode = 'edit' | 'view' | 'create';

export type FormTab =
  | 'geral'
  | 'comercial'
  | 'inventario'
  | 'midia'
  | 'oem'
  | 'codigos'
  | 'fornecimento'
  | 'equivalentes'
  | 'compatibilidade'
  | 'tags'
  | 'observacoes'
  | 'classification'
  | 'logistics'
  | 'visibility';

export interface MediaImageItem {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrimary: boolean;
  order: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}
