export interface VehicleApplicationFilters {
  page: number;
  per_page: number;
  year: string | null;
  search: string | null;
  active: number | null;
  vehicle_model_id: string | null;
  vehicle_brand_id: string | null;
  vehicle_version_id: string | null;
  vehicle_engine_id: string | null;
}
