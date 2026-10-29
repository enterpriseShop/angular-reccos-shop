import { ProductCodeResponse } from '../core/models/compatibility/product-codes/product-codes-response.model';
import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';

export const productCodesTableColumns: TableColumn<ProductCodeResponse>[] = [
  {
    key: 'code',
    header: 'Código / Identificador',
    width: '210px',
    valueGetter: (item: ProductCodeResponse) => item.code,
  },
  {
    key: 'code_type',
    header: 'Tipo de Código',
    width: '180px',
    align: 'center',
    type: 'badge',
    badgeConfig: (item: ProductCodeResponse) => ({
      text: item.code_type?.name || 'Geral',
      variant: item.code_type?.name === 'EAN' ? 'info' : 'neutral',
    }),
  },
  {
    key: 'product',
    header: 'Produto Associado',
    width: '320px',
    valueGetter: (item: ProductCodeResponse) => {
      if (!item.product) return '—';
      return `${item.product.name} [${item.product.internal_code || 'S/C'}]`;
    },
  },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    align: 'center',
    type: 'badge',
    badgeConfig: (item: ProductCodeResponse) => ({
      text: item.status?.name || (item.status?.name ? 'Ativo' : 'Inativo'),
      variant: item.status?.name !== 'active' ? 'success' : 'neutral',
    }),
  },
  {
    key: 'created_at',
    header: 'Data de Cadastro',
    width: '140px',
    align: 'center',
    type: 'date',
  },
];

export const productCodesTableActions: TableAction<ProductCodeResponse>[] = [
  {
    id: 'copy',
    label: 'Copiar',
    icon: 'copy',
    colorClass:
      'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700',
    title: 'Copiar Código',
  },
  {
    id: 'view',
    label: 'Visualizar',
    icon: 'eye',
    colorClass: 'text-slate-400 hover:text-[#5A8DEE] hover:bg-slate-100 dark:hover:bg-slate-700',
    title: 'Visualizar Detalhes',
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'edit',
    colorClass: 'text-slate-400 hover:text-[#4F8A6B] hover:bg-slate-100 dark:hover:bg-slate-700',
    title: 'Editar Código',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    title: 'Excluir Código',
  },
];
