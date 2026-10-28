export interface VersionInVehicleEngine {
  id: string;
  name: string;
  displacement: string;
  fuel: string;
  horsepower: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  versions: VehicleEngineVersion[];
}

export interface VehicleEngineVersion {
  id: string;
  name: string;
  model: VehicleEngineModel;
}

export interface VehicleEngineModel {
  id: string;
  name: string;
  brand: VehicleEngineBrand;
}

export interface VehicleEngineBrand {
  id: string;
  name: string;
}
