import { VehicleBrandResponse } from '../vehicles-brands/vehicle-brand-response.model';
import { VehicleEngineResponse } from '../vehicles-engine/vehicle-engine.model';
import { VehicleVersionResponse } from '../vehicles-version/vehicle-version.model';

export interface VehicleApplicationResponse extends Record<string, unknown> {
  id: string;
  vehicle_brand_id: string;
  vehicle_model_id: string;
  vehicle_version_id: string;
  vehicle_engine_id: string | null;
  year_from: number | null;
  year_to: number | null;
  notes: string | null;
  active: boolean;

  brand: VehicleBrandResponse | null;
  model: VehicleBrandResponse | null;
  engine: VehicleEngineResponse | null;
  version: VehicleVersionResponse | null;

  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleApplicationRequest {
  vehicle_brand_id: string;
  vehicle_model_id: string;
  vehicle_version_id: string;
  vehicle_engine_id: string | null;
  year_from: number | null;
  year_to: number | null;
  notes: string | null;
  active: boolean;
}

export interface VehicleApplicationFilters {
  page: number;
  per_page: number;
  year: string | null;
  search: string | null;
  active: boolean | string;
  vehicle_model_id: string | null;
  vehicle_brand_id: string | null;
}

export interface VehicleModelOption {
  id: string;
  label: string;
  vehicle_brand_id: string;
}

export interface VehicleVersionOption {
  id: string;
  label: string;
  vehicle_model_id: string;
}

export interface VehicleEngineOption {
  id: string;
  label: string;
  vehicle_version_id: string;
  code: string;
}
