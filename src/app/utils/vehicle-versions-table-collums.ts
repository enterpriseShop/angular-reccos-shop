import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleVersionResponse } from '../core/models/vehicles-version/vehicle-version.model';

export const vehicleVersionsTableColumns: TableColumn<VehicleVersionResponse>[] = [
  {
    key: 'brand',
    header: 'Montadora / Marca',
    width: '180px',
    align: 'left',
    cellFormatter: (v: VehicleVersionResponse) => {
      const brandName = v.model?.brand?.name;
      return brandName || '—';
    },
  },
  {
    key: 'model',
    header: 'Modelo',
    width: '180px',
    align: 'left',
    cellFormatter: (v: VehicleVersionResponse) => v.model?.name || '—',
    sortable: true,
  },
  {
    key: 'name',
    header: 'Versão / Acabamento',
    align: 'left',
    cellFormatter: (v: VehicleVersionResponse) => v.name,
    sortable: true,
  },
  {
    key: 'engines_count',
    header: 'Motores',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (v: VehicleVersionResponse) => {
      const count = v.engines?.length ?? v.engines_count ?? 0;
      return {
        text: `${count} motores`,
        variant: count > 0 ? 'info' : 'neutral',
        icon: 'cpu',
      };
    },
  },
  {
    key: 'applications_count',
    header: 'Aplicações',
    width: '140px',
    align: 'center',
    type: 'badge',
    badgeConfig: (v: VehicleVersionResponse) => {
      const count = v.applications_count || 0;
      return {
        text: `${count} aplicações`,
        variant: count > 0 ? 'success' : 'neutral',
        icon: 'tool',
      };
    },
  },
  {
    key: 'active',
    header: 'Status',
    width: '110px',
    align: 'center',
    type: 'badge',
    badgeConfig: (v: VehicleVersionResponse) => ({
      text: v.active ? 'Ativo' : 'Inativo',
      variant: v.active ? 'success' : 'neutral',
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

export const vehicleVersionsTableActions: TableAction<VehicleVersionResponse>[] = [
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
    title: 'Editar Versão',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Versão',
  },
];
