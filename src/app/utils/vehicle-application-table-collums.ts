import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleApplicationResponse } from '../core/models/vehicle-application/vehicle-application.model';

export const vehicleApplicationTableColumns: TableColumn<VehicleApplicationResponse>[] = [
  {
    key: 'brand',
    header: 'Montadora',
    width: '140px',
    valueGetter: (app: VehicleApplicationResponse) => app.brand?.name || '-',
  },
  {
    key: 'model',
    header: 'Modelo & Versão',
    valueGetter: (app: VehicleApplicationResponse) => {
      const model = app.model?.name || 'Modelo não especificado';
      const version = app.version?.name ? ` • ${app.version.name}` : '';
      return `${model}${version}`;
    },
  },
  {
    key: 'engine',
    header: 'Motorização',
    width: '180px',
    valueGetter: (app: VehicleApplicationResponse) => {
      if (!app.engine) return 'Todas as Motorizações';
      const disp = app.engine.displacement ? ` ${app.engine.displacement}` : '';
      const fuel = app.engine.fuel ? ` (${app.engine.fuel})` : '';
      return `${app.engine.name}${disp}${fuel}`;
    },
  },
  {
    key: 'year_range',
    header: 'Anos Compatíveis',
    width: '150px',
    align: 'center',
    type: 'badge',
    badgeConfig: (app: VehicleApplicationResponse) => {
      const from = app.year_from ? String(app.year_from) : '...';
      const to = app.year_to ? String(app.year_to) : 'Atual';
      return {
        text: `${from} - ${to}`,
        variant: 'info',
        icon: 'calendar',
      };
    },
  },
  {
    key: 'notes',
    header: 'Observações Técnicas',
    width: '200px',
    valueGetter: (app: VehicleApplicationResponse) => app.notes || '-',
  },
  {
    key: 'active',
    header: 'Status',
    width: '110px',
    align: 'center',
    type: 'badge',
    badgeConfig: (app: VehicleApplicationResponse) => ({
      text: app.active ? 'Ativo' : 'Inativo',
      variant: app.active ? 'success' : 'neutral',
    }),
  },
];

export const vehicleApplicationTableActions: TableAction<VehicleApplicationResponse>[] = [
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
    title: 'Editar Aplicação',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Aplicação',
  },
];
