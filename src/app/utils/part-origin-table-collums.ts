import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { PartOriginResponse } from '../core/models/part-origin/part-origin-response';

export const partOriginTableColumns: TableColumn<PartOriginResponse>[] = [
  {
    key: 'id',
    header: 'Tipo',
    width: '60px',
    align: 'center',
    type: 'icon',
    iconGetter: () => 'map-pin',
  },
  { key: 'name', header: 'Origem da Peça', width: '220px' },
  {
    key: 'description',
    header: 'Descrição / Detalhes',
    valueGetter: (po: PartOriginResponse) => po.description || '—',
  },
  {
    key: 'display_order',
    header: 'Ordem',
    width: '90px',
    align: 'center',
    valueGetter: (po: PartOriginResponse) => `#${po.display_order ?? 0}`,
  },
  {
    key: 'active',
    header: 'Status',
    width: '120px',
    align: 'center',
    type: 'badge',
    badgeConfig: (po: PartOriginResponse) => ({
      text: po.active ? 'Ativo' : 'Inativo',
      variant: po.active ? 'success' : 'neutral',
    }),
  },
  {
    key: 'created_at',
    header: 'Criado em',
    width: '120px',
    align: 'center',
    type: 'date',
  },
];

export const partOriginTableActions: TableAction<PartOriginResponse>[] = [
  {
    id: 'view',
    label: 'Visualizar',
    icon: 'eye',
    colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Visualizar Detalhes',
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'edit',
    colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Editar Origem',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Origem',
  },
];
