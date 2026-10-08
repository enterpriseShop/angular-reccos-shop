import { VehicleModelResponse } from '../vehicles-model/vehicle-model.model';

export interface VehicleVersion {
  id: string;
  active: boolean;
  name: string;
  code: string;
  fuel: string | null;
  fuel_type: string | null;
  horsepower: number | null;
  displacement: string | null;
  vehicle_version_id: string;
}

export interface VehicleVersionResponse extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  engines_count: number;
  vehicle_model_id: string;
  applications_count: number;
  engines: VehicleVersion[];
  model: VehicleModelResponse | null;
}

export interface VehicleVersionFilters {
  page: number;
  per_page: number;
  search: string | null;
  q: string | null;
  vehicle_brand_id: string | null;
  vehicle_model_id: string | null;
  active: number | null;
}

export interface VehicleVersionOption {
  id: string;
  label: string;
  vehicle_model_id: string;
  model_name: string;
  active: boolean;
}
