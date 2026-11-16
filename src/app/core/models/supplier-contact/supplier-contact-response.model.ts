import { SupplierContactDepartment } from './supplier-contact-depto.model';

export interface SupplierContactResponse {
  id: string;
  name: string;
  email: string;
  active: boolean;
  supplier_id: string;
  is_primary: boolean;
  role: string | null;
  notes: string | null;
  phone: string | null;
  mobile: string | null;
  has_whatsapp: boolean;
  extension: string | null;
  created_at: string | null;
  updated_at: string | null;
  department: SupplierContactDepartment | string;
}
