import { ProductEquivalentResponse } from '../core/models/compatibility/product-equivalent/product-equivalent-response';
import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';

export const productEquivalentTableColumns: TableColumn<ProductEquivalentResponse>[] = [
  {
    key: 'product',
    header: 'Produto de Origem (Principal)',
    width: '280px',
    valueGetter: (item: ProductEquivalentResponse) => {
      if (!item.product) return '—';
      return `${item.product.name} [${item.product.slug || 'S/C'}]`;
    },
  },
  {
    key: 'relation_badge',
    header: 'Equivalência',
    width: '140px',
    align: 'center',
    type: 'badge',
    badgeConfig: () => ({
      text: 'Substituível por',
      variant: 'info',
    }),
  },
  {
    key: 'equivalent_product',
    header: 'Produto Equivalente (Alternativa)',
    width: '280px',
    valueGetter: (item: ProductEquivalentResponse) => {
      if (!item.equivalent_product) return '—';
      return `${item.equivalent_product.name} [${item.equivalent_product.name || 'S/C'}]`;
    },
  },
  {
    key: 'observation',
    header: 'Observação Técnica',
    width: '240px',
    valueGetter: (item: ProductEquivalentResponse) =>
      item.observation || 'Sem observações registradas',
  },
  {
    key: 'created_at',
    header: 'Data de Cadastro',
    width: '130px',
    align: 'center',
    type: 'date',
  },
];

export const productEquivalentTableActions: TableAction<ProductEquivalentResponse>[] = [
  {
    id: 'view',
    label: 'Visualizar',
    icon: 'eye',
    colorClass: 'text-slate-400 hover:text-[#5A8DEE] hover:bg-slate-100 dark:hover:bg-slate-700',
    title: 'Visualizar Detalhes',
  },
  {
    id: 'edit',
    label: 'Editar Observação',
    icon: 'edit',
    colorClass: 'text-slate-400 hover:text-[#4F8A6B] hover:bg-slate-100 dark:hover:bg-slate-700',
    title: 'Editar Observação',
  },
  {
    id: 'delete',
    label: 'Excluir Relacionamento',
    icon: 'trash-2',
    colorClass: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    title: 'Excluir Relacionamento',
  },
];
