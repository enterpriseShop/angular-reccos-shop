import { SUPPLIER_CONTACT_DEPARTMENTS } from '../../utils/supplier-contact-depto';

export function getDepartmentLabel(department: string | null | undefined): string {
  if (!department) return 'Não informado';
  const found = SUPPLIER_CONTACT_DEPARTMENTS.find((d) => d.value === department);
  return found ? found.label : department;
}
