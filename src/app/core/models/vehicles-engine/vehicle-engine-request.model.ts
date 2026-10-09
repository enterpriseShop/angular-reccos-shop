export interface VehicleEngineRequest {
  vehicle_version_id: string | null;
  name: string;
  displacement: string | null;
  fuel: string | null;
  horsepower: number | null;
  active: boolean;
}
