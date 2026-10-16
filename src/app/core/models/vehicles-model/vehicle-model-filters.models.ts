export interface VehicleModelFiltersResponse {
  brand: string | null;
  search: string | null;
  version: string | null;
  vehicle_brand_id: string | null;
  active: number | null;
  page: number;
  per_page: number;
}

export interface VehicleGeneralFiltersRequest {
  model: string | null;
  vehicle_brand_id: string | null;
  vehicle_model_id: string | null;
  vehicle_version_id: string | null;
}
