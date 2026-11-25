import { SupplierContactRequest } from '../supplier-contact/supplier-contact-request.model';

export interface SupplierRequest {
  corporate_name: string;
  trade_name: string | null;
  document: string | null;
  state_registration: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status_id: string | null;
  contacts: SupplierContactRequest[];
}
