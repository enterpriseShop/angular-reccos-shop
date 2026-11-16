export interface SupplierFilterRequest {
  name: string | null;
  city: string | null;
  state: number | null;
  page: number | null;
  active: number | null;
  per_page: number | null;
  document: string | null;
  status_id: string | null;
}
