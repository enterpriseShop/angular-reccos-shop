export interface CreateProductPayload {
  category_id: string;
  manufacturer_id: string;
  status_id?: string;

  internal_code: string;
  name: string;

  slug?: string;
  icon?: string;
  image?: string;

  short_description?: string;
  description?: string;

  weight?: number;
  height?: number;
  width?: number;
  length?: number;

  active?: boolean;
  featured?: boolean;

  unit?: string;

  price: ProductPricePayload;

  inventory: ProductInventoryPayload;
}

export interface ProductPricePayload {
  price: number;
  promotional_price?: number;
  promotion_start?: string; // YYYY-MM-DD
  promotion_end?: string; // YYYY-MM-DD
}

export interface ProductInventoryPayload {
  warehouse_id: string;

  quantity: number;

  minimum_quantity?: number;
  maximum_quantity?: number;

  allow_backorder?: boolean;
}
