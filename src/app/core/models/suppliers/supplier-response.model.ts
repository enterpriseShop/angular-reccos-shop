import { SupplierContactResponse } from '../supplier-contact/supplier-contact-response.model';
import { StatusResource } from './supplier-status-response.model';

export interface SupplierResponse extends Record<string, unknown> {
  id: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  notes: string | null;
  street: string | null;
  number: string | null;
  website: string | null;
  corporate_name: string;
  document: string | null;
  zip_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  complement: string | null;
  trade_name: string | null;
  neighborhood: string | null;
  status: StatusResource | null;
  state_registration: string | null;
  contacts: SupplierContactResponse[] | null;
}
