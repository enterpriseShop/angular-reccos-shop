import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleEngineResponse } from '../core/models/vehicles-engine/vehicle-engine.model';

export const vehicleEngineTableColumns: TableColumn<VehicleEngineResponse>[] = [
  {
    key: 'brand',
    header: 'Montadora / Marca',
    width: '170px',
    align: 'left',
    cellFormatter: (e: VehicleEngineResponse) => {
      const version = e.name;
      const brand = version;
      return brand || '—';
    },
  },
  {
    key: 'vehicle',
    header: 'Modelo & Versão',
    width: '220px',
    align: 'left',
    cellFormatter: (e: VehicleEngineResponse) => {
      const version = e.name;
      const model = version;
      const modelName = model || '';
      const versionName = version || '';
      if (modelName && versionName) {
        return `${modelName} — ${versionName}`;
      }
      return versionName || modelName || '—';
    },
    sortable: true,
  },
  {
    key: 'name',
    header: 'Motor / Cilindrada',
    align: 'left',
    cellFormatter: (e: VehicleEngineResponse) => {
      const parts: string[] = [e.name];
      if (e.displacement) {
        parts.push(`(${e.displacement})`);
      }
      return parts.join(' ');
    },
    sortable: true,
  },
  {
    key: 'horsepower',
    header: 'Potência',
    width: '110px',
    align: 'center',
    type: 'badge',
    badgeConfig: (e: VehicleEngineResponse) => {
      const hp = e.horsepower;
      if (hp !== null && hp !== undefined) {
        return {
          text: `${hp} cv`,
          variant: 'info',
          icon: 'zap',
        };
      }
      return {
        text: '—',
        variant: 'neutral',
      };
    },
  },
  {
    key: 'fuel',
    header: 'Combustível',
    width: '140px',
    align: 'center',
    type: 'badge',
    badgeConfig: (e: VehicleEngineResponse) => {
      const fuelVal = e.name || '—';
      let variant: 'success' | 'warning' | 'info' | 'neutral' = 'neutral';
      if (fuelVal.toLowerCase().includes('flex')) variant = 'success';
      else if (fuelVal.toLowerCase().includes('diesel')) variant = 'warning';
      else if (
        fuelVal.toLowerCase().includes('elétrico') ||
        fuelVal.toLowerCase().includes('híbrido')
      )
        variant = 'info';

      return {
        text: fuelVal,
        variant,
        icon: 'fuel',
      };
    },
  },
  {
    key: 'applications_count',
    header: 'Aplicações',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (e: VehicleEngineResponse) => {
      const count = e.active ? 1 : 0;
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
    badgeConfig: (e: VehicleEngineResponse) => ({
      text: e.active ? 'Ativo' : 'Inativo',
      variant: e.active ? 'success' : 'neutral',
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

export const vehicleEngineTableActions: TableAction<VehicleEngineResponse>[] = [
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
    title: 'Editar Motor',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Motor',
  },
];
