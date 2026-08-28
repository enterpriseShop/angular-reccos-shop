import { TableHeaderOption } from '../../../../../../core/models/generals/table-inventory.model';

export const tableHeaders: TableHeaderOption[] = [
  {
    key: 'warehouse',
    label: 'Depósito',
    align: 'left',
    minWidth: 'min-w-[240px]',
    showInReadOnly: true,
  },
  {
    key: 'quantity',
    label: 'Saldo Físico (un)',
    align: 'center',
    minWidth: 'min-w-[180px]',
    showInReadOnly: true,
  },
  {
    key: 'reservedQuantity',
    label: 'Reservado',
    align: 'center',
    minWidth: 'min-w-[100px]',
    showInReadOnly: true,
  },
  {
    key: 'availableQuantity',
    label: 'Disponível',
    align: 'center',
    minWidth: 'min-w-[100px]',
    showInReadOnly: true,
  },
  {
    key: 'minQuantity',
    label: 'Est. Mínimo',
    align: 'left',
    minWidth: 'min-w-[110px]',
    showInReadOnly: true,
  },
  {
    key: 'maxQuantity',
    label: 'Est. Máximo',
    align: 'left',
    minWidth: 'min-w-[110px]',
    showInReadOnly: true,
  },
  {
    key: 'allowBackorder',
    label: 'Backorder',
    align: 'center',
    minWidth: 'min-w-[110px]',
    showInReadOnly: true,
  },
  {
    key: 'active',
    label: 'Status',
    align: 'center',
    minWidth: 'min-w-[90px]',
    showInReadOnly: true,
  },
  { key: 'actions', label: 'Ações', align: 'center', width: 'w-[60px]', showInReadOnly: false },
];
