import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { ProductOemCodeResource } from '../core/models/oem-codes/oem-codes.model';

export const oemCodesTableColumns: TableColumn<ProductOemCodeResource>[] = [
  {
    key: 'id',
    header: 'Tipo',
    width: '60px',
    align: 'center',
    type: 'icon',
    iconGetter: () => 'barcode',
  },
  {
    key: 'oem_code',
    header: 'Código OEM',
    width: '220px',
    valueGetter: (item: ProductOemCodeResource) => item.oem_code,
  },
  {
    key: 'manufacturer',
    header: 'Montadora / Fabricante',
    width: '240px',
    valueGetter: (item: ProductOemCodeResource) => item.manufacturer?.name || '—',
  },
  {
    key: 'products_count',
    header: 'Produtos Vinculados',
    width: '160px',
    align: 'center',
    type: 'badge',
    badgeConfig: (item: ProductOemCodeResource) => ({
      text: `${item.products_count ?? 0} produto(s)`,
      variant: Number(item.products_count ?? 0) > 0 ? 'success' : 'neutral',
    }),
  },
  {
    key: 'created_at',
    header: 'Registrado em',
    width: '140px',
    align: 'center',
    type: 'date',
  },
];

export const oemCodesTableActions: TableAction<ProductOemCodeResource>[] = [
  {
    id: 'copy',
    label: 'Copiar',
    icon: 'copy',
    colorClass:
      'text-gray-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Copiar Código OEM',
  },
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
    title: 'Editar Código OEM',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Código OEM',
  },
];
