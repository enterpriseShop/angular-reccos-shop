import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { ProductResponse } from '../core/models/products/product-response.model';

export const productTableColumns: TableColumn<ProductResponse>[] = [
  { key: 'internal_code', header: 'Código Interno', width: '130px' },
  { key: 'name', header: 'Nome do Produto' },
  {
    key: 'category.name',
    header: 'Categoria',
    width: '160px',
    valueGetter: (p) => p.category?.name || 'Sem Categoria',
  },
  {
    key: 'manufacturer.name',
    header: 'Fabricante',
    width: '140px',
    valueGetter: (p) => p.manufacturer?.name || 'N/A',
  },
  {
    key: 'pricing.current_price',
    header: 'Preço Venda',
    width: '130px',
    align: 'right',
    type: 'currency',
    valueGetter: (p) => p.pricing?.current_price ?? 0,
  },
  {
    key: 'inventory.available_quantity',
    header: 'Estoque',
    width: '100px',
    align: 'center',
    valueGetter: (p) => p.inventory?.available_quantity ?? 0,
  },
  {
    key: 'status',
    header: 'Status',
    width: '130px',
    align: 'center',
    type: 'badge',
    badgeConfig: (p) => ({
      text: p.status?.name || (p.active ? 'Ativo' : 'Inativo'),
      variant: p.status?.code === 'ACTIVE' || p.active ? 'success' : 'neutral',
      color: p.status?.color,
    }),
  },
];

export const productTableActions: TableAction<ProductResponse>[] = [
  {
    id: 'view',
    label: 'Visualizar',
    icon: 'eye',
    colorClass: 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Visualizar Produto',
    handler: (p) => ['/catalog/products', p.id, 'view'],
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'edit',
    colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Editar Produto',
    handler: (p) => ['/catalog/products', p.id, 'edit'],
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Produto',
    handler: (p) => ['delete', p.id],
  },
];
