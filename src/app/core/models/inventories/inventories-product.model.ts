export interface ProductInventory {
  id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity?: number;
  minimum_quantity: number;
  maximum_quantity: number;
  allow_backorder: boolean;
  active: boolean;
  warehouse: {
    id: string;
    name: string;
    code: string | null;
  };
}
