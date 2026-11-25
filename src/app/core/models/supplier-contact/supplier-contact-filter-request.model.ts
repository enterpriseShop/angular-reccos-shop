import { SupplierContactDepartment } from './supplier-contact-depto.model';

export interface SupplierContactFiltersRequest {
  search: string | null;
  active: boolean | null;
  is_primary: boolean | null;
  page: number | null;
  per_page: number | null;
  department: SupplierContactDepartment | 'all';
}
