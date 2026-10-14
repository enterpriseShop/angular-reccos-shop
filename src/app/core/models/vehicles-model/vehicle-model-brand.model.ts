export interface VehicleModelInBrandResponse {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand: Brand;
  versions: VehicleVersion[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleVersion {
  id: string;
  vehicle_model_id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
