import { SupplierDepartmentOption } from '../core/models/supplier-contact/supplier-contact-depto-option.model';

export const SUPPLIER_CONTACT_DEPARTMENTS: SupplierDepartmentOption[] = [
  {
    value: 'commercial',
    label: 'Comercial',
    badgeClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    value: 'financial',
    label: 'Financeiro',
    badgeClass:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    value: 'logistics',
    label: 'Logística',
    badgeClass:
      'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    value: 'technical',
    label: 'Técnico / Garantia',
    badgeClass:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    value: 'other',
    label: 'Outro',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
];
