import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { VehicleEngineResponse } from '../core/models/vehicles-engine/vehicle-engine.model';

export const vehicleEngineTableColumns: TableColumn<VehicleEngineResponse>[] = [
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
    key: 'fuel',
    header: 'Combustível',
    width: '140px',
    align: 'center',
    type: 'badge',
    badgeConfig: (e: VehicleEngineResponse) => {
      const fuelVal = e.fuel || '—';
      let variant: 'success' | 'warning' | 'info' | 'neutral' = 'neutral';
      const lower = fuelVal.toLowerCase();
      if (lower.includes('flex')) variant = 'success';
      else if (lower.includes('diesel')) variant = 'warning';
      else if (lower.includes('elétrico') || lower.includes('híbrido')) variant = 'info';

      return {
        text: fuelVal,
        variant,
        icon: 'fuel',
      };
    },
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
    key: 'versions',
    header: 'Versões Compatíveis',
    width: '170px',
    align: 'center',
    type: 'badge',
    badgeConfig: (e: VehicleEngineResponse) => {
      const count = e.versions ? e.versions.length : 0;
      return {
        text: count === 0 ? 'Sem versão' : count === 1 ? '1 versão' : `${count} versões`,
        variant: count > 0 ? 'info' : 'neutral',
        icon: 'git-branch',
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
