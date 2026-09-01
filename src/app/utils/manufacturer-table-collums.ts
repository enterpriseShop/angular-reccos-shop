import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { ManufacturerResponse } from '../core/models/manufactureres/manufacturer-response.model';

export const manufacturerTableColumns: TableColumn<ManufacturerResponse>[] = [
  {
    key: 'image',
    header: 'Logo',
    width: '70px',
    align: 'center',
    type: 'icon',
    iconGetter: () => 'building',
  },
  { key: 'name', header: 'Fabricante / Marca' },
  { key: 'slug', header: 'Slug / URL', width: '160px' },
  {
    key: 'website',
    header: 'Website Oficial',
    width: '240px',
    valueGetter: (m: ManufacturerResponse) => m.website || '—',
  },
  {
    key: 'active',
    header: 'Status',
    width: '120px',
    align: 'center',
    type: 'badge',
    badgeConfig: (m: ManufacturerResponse) => ({
      text: m.active ? 'Ativo' : 'Inativo',
      variant: m.active ? 'success' : 'neutral',
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

export const manufacturerTableActions: TableAction<ManufacturerResponse>[] = [
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
    title: 'Editar Fabricante',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Fabricante',
  },
];
