export interface ProductFormState {
  name: string;
  internal_code: string;
  category_id: string;
  manufacturer_id: string;
  unit: string;
  unit_id: string;
  slug: string;
  description: string;

  weight: number;
  height: number;
  width: number;
  length: number;

  price: number;
  promotional_price: number | null;
  promotion_start_date: string;
  promotion_end_date: string;

  warehouse_id: string;
  quantity: number;
  minimum_quantity: number;
  maximum_quantity: number | null;
  allow_backorder: boolean;
}
