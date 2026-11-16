import { SupplierContactResponse } from '../supplier-contact/supplier-contact-response.model';
import { StatusResource } from './supplier-status-response.model';

export interface SupplierResponse {
  id: string;
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
  status?: StatusResource;
  contacts?: SupplierContactResponse[];
  created_at: string | null;
  updated_at: string | null;
}
