import { VehicleVersionResponse } from '../vehicles-version/vehicle-version.model';

export interface VehicleEngineVersionItem {
  id: string;
  name: string;
  model?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
  };
}

export interface VehicleEngineResponse extends Record<string, unknown> {
  id: string;
  name: string;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  applications_count?: number;
  versions?: VehicleEngineVersionItem[];
  vehicle_version_id?: string;
  version?: VehicleVersionResponse | null;
}

export interface CreateVehicleEnginePayload {
  name: string;
  displacement?: string | null;
  fuel?: string | null;
  horsepower?: number | null;
  active: boolean;
  version_ids?: string[];
  vehicle_version_id?: string;
}

export interface UpdateVehicleEnginePayload {
  name?: string;
  displacement?: string | null;
  fuel?: string | null;
  horsepower?: number | null;
  active?: boolean;
  version_ids?: string[];
  vehicle_version_id?: string;
}

export interface VehicleEngineFilters {
  page: number;
  per_page: number;
  search: string;
  q?: string;
  vehicle_brand_id?: string;
  vehicle_model_id?: string;
  vehicle_version_id?: string;
  fuel?: string;
  active: boolean | string;
}

export interface VehicleEngineOption {
  id: string;
  label: string;
  value?: string;
  sublabel?: string;
  vehicle_version_id?: string;
  name?: string;
  displacement?: string | null;
  fuel?: string | null;
  horsepower?: number | null;
  active?: boolean;
}
