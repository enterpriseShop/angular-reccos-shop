import { ManufacturerSummaryResponse } from '../manufactureres/manufaturer-summary-response.model';
import { ProductSummaryResponse } from '../products/product-response.model';

export interface ProductOemCodeResource extends Record<string, unknown> {
  id: string;
  oem_code: string;
  product: ProductSummaryResponse | null;
  manufacturer: ManufacturerSummaryResponse;
  products_count: number | string;
  created_at: string;
  updated_at: string;
}

export interface ProductOemCodeRequest {
  manufacturer_id: string;
  oem_code: string;
}

// VALIDAR DE INTERFACES ABAIXO
export interface OemCode {
  id: string;
  oem_code: string;
  manufacturer: ManufacturerSummaryResponse;
  created_at: string;
  updated_at: string;
}

export interface ProductOemCodeSummary {
  id: string;
  oem_code: string;
  manufacturer_id: string;
  manufacturer_name?: string;
  label?: string;
  value?: string;
}

export interface ProductOemCodeOptionResource {
  id: string;
  oem_code: string;
  manufacturer_id: string;
  manufacturer?: ManufacturerSummaryResponse | null;
}

export interface ProductOemCodeFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  manufacturer_id?: string;
}

export interface GeneralOptionsParams {
  search?: string;
  active?: boolean;
  limit?: number;
  module?: string;
  manufacturer_id?: string;
}
