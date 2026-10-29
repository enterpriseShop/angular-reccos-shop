export interface ProductCodeFiltersRequest {
  code: string | null;
  page: number | null;
  active: number | null;
  module: string | null;
  per_page: number | null;
  product_id: string | null;
  status_code: string | null;
  code_type_id: string | null;
}
