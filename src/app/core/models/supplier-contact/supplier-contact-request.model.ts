import { SupplierContactDepartment } from './supplier-contact-depto.model';

export interface SupplierContactRequest {
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  extension: string | null;
  mobile: string | null;
  has_whatsapp: boolean;
  is_primary: boolean;
  active: boolean;
  notes: string | null;
  department: SupplierContactDepartment | string;
}
