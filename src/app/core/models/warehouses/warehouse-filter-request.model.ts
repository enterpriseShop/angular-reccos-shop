export interface WarehouseFiltersRequest {
  page: number | null;
  name: string | null;
  code: string | null;
  active: number | null;
  per_page: number | null;
  status_id: string | null;
}
