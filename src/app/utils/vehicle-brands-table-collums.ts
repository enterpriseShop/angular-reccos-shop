import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleBrandResponse } from '../core/models/vehicles-brands/vehicle-brand-response.model';

export const vehicleBrandsTableColumns: TableColumn<VehicleBrandResponse>[] = [
  {
    key: 'image',
    header: 'Logo',
    width: '70px',
    align: 'center',
    type: 'icon',
    iconGetter: () => 'car',
  },
  {
    key: 'name',
    header: 'Marca / Montadora',
  },
  {
    key: 'slug',
    header: 'Slug / URL',
    width: '160px',
    valueGetter: (b: VehicleBrandResponse) => `/${b.slug}`,
  },
  {
    key: 'display_order',
    header: 'Ordem',
    width: '100px',
    align: 'center',
    valueGetter: (b: VehicleBrandResponse) => `#${b.display_order ?? 1}`,
  },
  {
    key: 'models_count',
    header: 'Modelos',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (b: VehicleBrandResponse) => ({
      text: `${b.models_count || 0} modelos`,
      variant: (b.models_count || 0) > 0 ? 'info' : 'neutral',
      icon: 'car',
    }),
  },
  {
    key: 'active',
    header: 'Status',
    width: '110px',
    align: 'center',
    type: 'badge',
    badgeConfig: (b: VehicleBrandResponse) => ({
      text: b.active ? 'Ativo' : 'Inativo',
      variant: b.active ? 'success' : 'neutral',
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

export const vehicleBrandsTableActions: TableAction<VehicleBrandResponse>[] = [
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
    title: 'Editar Montadora',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Montadora',
  },
];
