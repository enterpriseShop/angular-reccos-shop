import { SupplierContactDepartment } from './supplier-contact-depto.model';

export interface SupplierContactFiltersRequest {
  search: string | null;
  active: boolean | null;
  is_primary: boolean | null;
  department: SupplierContactDepartment | 'all';
}
