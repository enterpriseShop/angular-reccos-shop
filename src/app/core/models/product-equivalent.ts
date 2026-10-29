import { ProductSummaryResource } from './oem-code';

export interface ProductEquivalent extends Record<string, unknown> {
  id: string;
  product_id?: string;
  equivalent_product_id?: string;
  observation?: string | null;
  product?: ProductSummaryResource | null;
  equivalent_product?: ProductSummaryResource | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductEquivalentDto {
  product_id: string;
  equivalent_product_id: string;
  observation?: string | null;
}

export interface UpdateProductEquivalentDto {
  product_id?: string;
  equivalent_product_id?: string;
  observation?: string | null;
}

export interface ProductEquivalentFilterParams {
  page?: number;
  per_page?: number;
  product_id?: string;
  equivalent_product_id?: string;
  search?: string;
}
