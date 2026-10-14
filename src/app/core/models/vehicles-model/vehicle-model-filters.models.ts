export interface VehicleModelFiltersResponse {
  brand: string | null;
  search: string | null;
  version: string | null;
  vehicle_brand_id: string | null;
  active: number | null;
  page: number;
  per_page: number;
}

export interface VehicleOptionsModelByBrandFilterRequest {
  model: string | null;
  vehicle_brand_id: string | null;
}
