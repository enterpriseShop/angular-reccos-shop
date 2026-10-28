export interface VehicleBrandResponse extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  active: boolean;
  display_order: number;
  models_count?: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleBrandPayloadRequest {
  name: string;
  slug: string;
  image: string | null;
  active: boolean;
  display_order?: number;
}

export interface VehicleBrandOption {
  id: string;
  label: string;
  slug: string;
  image?: string | null;
  display_order?: number;
  active?: boolean;
}
