import { CategoryResponse } from '../core/models/catetories/categories.model';
import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';

export const categoryTableColumns: TableColumn<CategoryResponse>[] = [
  { key: 'name', header: 'Nome da Categoria' },
  {
    key: 'parent_id',
    header: 'Categoria Pai',
    width: '180px',
    valueGetter: (c) => {
      if (!c.parent_id) return 'Categoria Raiz';
      return c.parent_id;
    },
  },
  { key: 'slug', header: 'Slug / URL', width: '160px' },
  { key: 'display_order', header: 'Ordem', width: '80px', align: 'center' },
  {
    key: 'active',
    header: 'Status',
    width: '120px',
    align: 'center',
    type: 'badge',
    badgeConfig: (c) => ({
      text: c.active ? 'Ativo' : 'Inativo',
      variant: c.active ? 'success' : 'neutral',
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

export const categoryTableActions: TableAction<CategoryResponse>[] = [
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
    title: 'Editar Categoria',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Categoria',
  },
];
