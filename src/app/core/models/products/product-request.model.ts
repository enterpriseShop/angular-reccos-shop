export interface CreateProductPayload {
  category_id: string | null;
  manufacturer_id: string | null;
  status_id?: string | null;

  internal_code: string | null;
  name: string | null;

  slug?: string | null;
  icon?: string | null;
  image?: string | null;

  short_description?: string | null;
  description?: string | null;

  weight?: number;
  height?: number;
  width?: number;
  length?: number;

  active?: boolean;
  featured?: boolean;

  unit?: string | null;

  price: ProductPricePayload;

  inventory: ProductInventoryPayload;
}

export interface ProductPricePayload {
  price: number;
  promotional_price?: number | null;
  promotion_start?: string | null;
  promotion_end?: string | null;
}

export interface ProductInventoryPayload {
  warehouse_id: string | null;

  quantity: number;

  minimum_quantity?: number;
  maximum_quantity?: number | null;

  allow_backorder?: boolean;
}

export interface UpdateProductPayload {
  category_id?: string | null;
  manufacturer_id?: string | null;
  status_id?: string | null;

  internal_code?: string | null;
  name?: string | null;

  slug?: string | null;
  icon?: string | null;
  image?: string | null;

  short_description?: string | null;
  description?: string | null;

  weight?: number;
  height?: number;
  width?: number;
  length?: number;

  active?: boolean;
  featured?: boolean;

  unit?: string | null;
}
