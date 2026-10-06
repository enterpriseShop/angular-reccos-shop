import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleModelResponse } from '../core/models/vehicles-model/vehicle-model.model';

export const vehicleModelTableColumns: TableColumn<VehicleModelResponse>[] = [
  {
    key: 'brand',
    header: 'Montadora / Marca',
    width: '220px',
    align: 'left',
    cellFormatter: (m: VehicleModelResponse) => (m.brand ? m.brand.name : '—'),
  },
  {
    key: 'name',
    header: 'Modelo do Veículo',
    align: 'left',
    cellFormatter: (m: VehicleModelResponse) => m.name + (m.slug ? ' (/' + m.slug + ')' : ''),
    sortable: true,
  },
  {
    key: 'versions_count',
    header: 'Versões',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (m: VehicleModelResponse) => ({
      text: `${m.versions?.length || 0} versões`,
      variant: (m.versions?.length || 0) > 0 ? 'info' : 'neutral',
      icon: 'layers',
    }),
  },
  {
    key: 'active',
    header: 'Status',
    width: '110px',
    align: 'center',
    type: 'badge',
    badgeConfig: (m: VehicleModelResponse) => ({
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

export const vehicleModelTableActions: TableAction<VehicleModelResponse>[] = [
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
    title: 'Editar Modelo',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Modelo',
  },
];
