import { VehicleVersionResponse } from '../vehicles-version/vehicle-version.model';

export interface VehicleEngineResponse extends Record<string, unknown> {
  id: string;
  name: string;
  active: boolean;
  fuel: string | null;
  created_at: string;
  updated_at: string;
  vehicle_version_id: string;
  horsepower: number | null;
  applications_count: number;
  displacement: string | null;
  version: VehicleVersionResponse | null;
}

export interface CreateVehicleEnginePayload {
  vehicle_version_id: string;
  name: string;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  active: boolean;
}

export interface UpdateVehicleEnginePayload {
  vehicle_version_id: string;
  name: string;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  active: boolean;
}

export interface VehicleEngineFilters {
  page: number;
  per_page: number;
  search: string;
  q: string;
  vehicle_brand_id: string;
  vehicle_model_id: string;
  vehicle_version_id: string;
  fuel: string;
  active: boolean | string;
}

export interface VehicleEngineOption {
  id: string;
  label: string;
  vehicle_version_id: string;
  name: string;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  active: boolean;
}
