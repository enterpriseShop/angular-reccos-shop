import { VehicleBrandResponse } from '../vehicles-brands/vehicle-brand-response.model';
import { GeneralOption } from '../generals/general-options-response.model';

export interface VehicleModelResponse extends Record<string, unknown> {
  id: string;
  vehicle_brand_id: string;
  name: string;
  slug: string;
  active: boolean;
  display_order: number;
  brand: VehicleBrandResponse | null;
  versions_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleModelRequest {
  vehicle_brand_id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface VehicleModelOption extends GeneralOption {
  id: string;
  slug: string;
  vehicle_brand_id: string;
  brand_name: string;
  active: boolean;
}
