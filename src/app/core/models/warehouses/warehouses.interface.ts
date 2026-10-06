import { StatusOption } from '../status/status-options.model';

export interface WarehouseResponse extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  status: StatusOption;
  description: string | null;
  inventories_count: number;
}
