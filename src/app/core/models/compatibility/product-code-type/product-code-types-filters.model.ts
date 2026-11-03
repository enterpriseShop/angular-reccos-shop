export interface ProductCodeTypeFiltersRequest {
  name: string | null;
  status_id: string | null;
  status_code: string | null;
  page: number | null;
  active: boolean | null;
  per_page: number | null;
}
