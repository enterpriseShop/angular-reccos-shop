import { GeneralOption } from '../generals/general-options-response.model';
import { VehicleBrandModelResponse } from '../vehicles-brands/vehicle-brand-model-response.model';
import { VehicleVersionModelResponse } from '../vehicles-version/vehicle-version-model-response.model';

export interface VehicleModelResponse extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand: VehicleBrandModelResponse | null;
  versions: VehicleVersionModelResponse[] | null;
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
