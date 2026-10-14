import { VehicleVersionResponse } from '../vehicles-version/vehicle-version.model';

export interface VehicleEngineBrandItem {
  id: string;
  name: string;
}

export interface VehicleEngineModelItem {
  id: string;
  name: string;
  brand?: VehicleEngineBrandItem | null;
}

export interface VehicleEngineVersionItem {
  id: string;
  name: string;
  model?: VehicleEngineModelItem | null;
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
  versions?: VehicleEngineVersionItem[];
  applications_count?: number;
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
