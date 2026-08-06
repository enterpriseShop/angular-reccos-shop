export interface CreateProductPayload {
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  unit_id: string;

  internal_code: string;
  barcode: string;

  name: string;
  short_description: string;
  description: string;

  weight: number;
  height: number;
  width: number;
  length: number;

  featured: boolean;
}

export interface ProductCreateResponse {
  success: boolean;
  message: string;
  data: ProductCreate;
}

export interface ProductCreate {
  id: string;
  status: ProductStatus;
  internal_code: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  short_description: string;
  description: string;
  weight: string;
  height: string;
  width: string;
  length: string;
  featured: boolean;
  is_sellable: boolean;
  commercial_status: CommercialStatus;
}

export interface ProductStatus {
  id: string;
  module: string;
  code: string;
  name: string;
  color: string;
  icon: string;
}

export type CommercialStatus = 'pending' | 'approved' | 'rejected';

// PARA REMOVER FUTURAMENTE APÓS UPDATE

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
  part_origin_id?: string | null;
  unit_id?: string | null;

  internal_code?: string | null;
  barcode?: string | null;
  name?: string | null;
  slug?: string | null;

  icon?: string | null;
  image?: string | null;

  short_description?: string | null;
  description?: string | null;

  weight?: number | null;
  height?: number | null;
  width?: number | null;
  length?: number | null;

  unit?: string | null;

  active?: boolean;
  featured?: boolean;

  price?: UpdateProductPricePayload;

  inventory?: UpdateProductInventoryPayload;
}

export interface UpdateProductPricePayload {
  price?: number | null;
  promotional_price?: number | null;
  promotion_start?: string | null;
  promotion_end?: string | null;
}

export interface UpdateProductInventoryPayload {
  warehouse_id?: string | null;
  quantity?: number | null;
  minimum_quantity?: number | null;
  maximum_quantity?: number | null;
  allow_backorder?: boolean;
}
