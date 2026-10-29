import { StatusResponse } from '../../status/status-product.model';

export interface ProductCodeTypeResponse extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  status: StatusResponse | null;
  created_at: string;
  updated_at: string;
}
