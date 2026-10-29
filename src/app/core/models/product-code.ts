export interface ProductCodeType extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  status_id: string | null;
  active: boolean;
  codes_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductCodeDto {
  product_id: string;
  code_type_id: string;
  code: string;
  status_id: string | null;
}

export interface UpdateProductCodeDto {
  product_id: string;
  code_type_id: string;
  code: string;
  status_id: string | null;
}

export interface CreateProductCodeTypeDto {
  name: string;
  description: string | null;
  status_id: string | null;
  active: boolean;
}

export interface UpdateProductCodeTypeDto {
  name: string;
  description: string | null;
  status_id: string | null;
  active: boolean;
}

export interface ProductCodeTypeFilterParams {
  page: number;
  per_page: number;
  active: boolean | number | string;
  search: string;
}
