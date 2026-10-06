export interface VehicleVersionRequest {
  name: string;
  active: boolean;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  vehicle_model_id: string;
  vehicle_version_id: string | null;
}
