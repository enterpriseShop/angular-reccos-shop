import { EntityReference } from '../generals/entity-reference';

export interface ProductSupplier {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier: {
    id: string;
    name?: string;
  };
  supplier_code: string | null;
  purchase_price: number;
  lead_time_days: number;
  minimum_order_quantity: number;
  preferred: boolean;
  active: boolean;
  observation: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  product?: EntityReference;
}
