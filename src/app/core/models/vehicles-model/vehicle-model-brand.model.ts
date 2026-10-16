export interface VehicleModelInBrandResponse {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand: BrandInModelResponse;
  versions: VehicleVersion[];
  created_at: string;
  updated_at: string;
  model: ModelInBrandResponse | null;
}

export interface ModelInBrandResponse {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand_name: string;
  vehicle_brand_id: string;
}

export interface BrandInModelResponse {
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
