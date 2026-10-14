export interface VehicleEngineRequest {
  name: string;
  displacement?: string | null;
  fuel?: string | null;
  horsepower?: number | null;
  active: boolean;
  version_ids?: string[];
  vehicle_version_id?: string | null;
}

