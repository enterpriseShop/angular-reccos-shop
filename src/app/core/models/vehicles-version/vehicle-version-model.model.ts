export interface ModelInVehicleVersion {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  vehicle_model_id: string;
  model: VehicleModelVersion;
}

export interface VehicleModelVersion {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand: VehicleBrandVersion;
}

export interface VehicleBrandVersion {
  id: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  display_order: number;
}
