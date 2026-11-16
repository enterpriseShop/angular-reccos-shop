import { TableAction, TableColumn } from '../core/models/list-table/list-table.model';
import { SupplierResponse } from '../core/models/suppliers/supplier-response.model';

export const supplierTableColumns: TableColumn<SupplierResponse>[] = [
  {
    key: 'id',
    header: 'Tipo',
    width: '56px',
    align: 'center',
    type: 'icon',
    iconGetter: () => 'building',
  },
  {
    key: 'document',
    header: 'CNPJ / CPF',
    width: '175px',
    valueGetter: (s: SupplierResponse) => s.document || 'Não informado',
  },
  {
    key: 'corporate_name',
    header: 'Fornecedor / Razão Social',
    valueGetter: (s: SupplierResponse) =>
      s.trade_name ? `${s.trade_name} — ${s.corporate_name}` : s.corporate_name,
  },
  {
    key: 'city',
    header: 'Localização',
    width: '155px',
    valueGetter: (s: SupplierResponse) => {
      if (s.city && s.state) return `${s.city}/${s.state}`;
      return s.city || s.state || '—';
    },
  },
  {
    key: 'contacts',
    header: 'Contato Principal',
    width: '210px',
    valueGetter: (s: SupplierResponse) => {
      const contacts = s.contacts || [];
      const primary =
        contacts.find((c) => c.is_primary && c.active !== false) ||
        contacts.find((c) => c.active !== false) ||
        contacts[0];
      if (primary) {
        const tel = primary.mobile || primary.phone || primary.email || '';
        return tel ? `${primary.name} (${tel})` : primary.name;
      }
      return s.phone || s.email || '—';
    },
  },
  {
    key: 'contacts_count',
    header: 'Contatos',
    width: '90px',
    align: 'center',
    valueGetter: (s: SupplierResponse) => `${s.contacts ?? (s.contacts || []).length}`,
  },
  {
    key: 'status',
    header: 'Status',
    width: '125px',
    align: 'center',
    type: 'badge',
    badgeConfig: (s: SupplierResponse) => {
      const stCode = (s.status?.code || '').toLowerCase();
      // const isAct = s.active ?? stCode === 'active';
      const isAct = 'active';
      let variant: 'success' | 'danger' | 'warning' | 'neutral' = 'neutral';
      if (isAct || stCode === 'active') {
        variant = 'success';
      } else if (stCode === 'inactive') {
        variant = 'neutral';
      } else if (stCode === 'review' || stCode === 'draft') {
        variant = 'warning';
      }

      return {
        text: s.status?.name || (isAct ? 'Ativo' : 'Inativo'),
        variant,
      };
    },
  },
  {
    key: 'created_at',
    header: 'Cadastro',
    width: '110px',
    align: 'center',
    type: 'date',
  },
];

export const supplierTableActions: TableAction<SupplierResponse>[] = [
  {
    id: 'view',
    label: 'Detalhes',
    icon: 'eye',
    colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Ver Detalhes do Fornecedor',
  },
  {
    id: 'contacts',
    label: 'Contatos',
    icon: 'user',
    colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Gerenciar Contatos do Fornecedor',
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'edit',
    colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Editar Fornecedor',
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'trash-2',
    colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
    title: 'Excluir Fornecedor',
  },
];
