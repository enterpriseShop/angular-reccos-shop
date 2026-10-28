export interface ProductFilterRequest {
  page: number | null;
  per_page: number | null;
  search: string | null;
  active: string | null;
  parent_id: string | null;
}
