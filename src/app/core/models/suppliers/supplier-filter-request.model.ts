export interface SupplierFilterRequest {
  name: string | null;
  city: string | null;
  page: number | null;
  state: string | null;
  active: number | null; // para um toggle
  per_page: number | null;
  document: string | null;
  status_id: string | null;
}
