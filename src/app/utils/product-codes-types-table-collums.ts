import { ProductCodeTypeResponse } from '../core/models/compatibility/product-code-type/product-code-type-response.model';
import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';

export const productCodeTypesTableColumns: TableColumn<ProductCodeTypeResponse>[] = [
  {
    key: 'name',
    header: 'Tipo de Código',
    width: '240px',
    valueGetter: (item) => item.name,
  },
  {
    key: 'description',
    header: 'Descrição Técnica',
    width: '320px',
    valueGetter: (item) => item.description || '—',
  },
  {
    key: 'status',
    header: 'Status',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (item) => ({
      text: item.status?.name || 'Sem status',
      variant: item.status?.code === 'active' ? 'success' : 'neutral',
    }),
  },
  {
    key: 'created_at',
    header: 'Criado em',
    width: '140px',
    align: 'center',
    type: 'date',
  },
];

export const productCodeTypeTableActions: TableAction<ProductCodeTypeResponse>[] = [
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
    title: 'Editar Tipo',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    title: 'Excluir Tipo',
  },
];
