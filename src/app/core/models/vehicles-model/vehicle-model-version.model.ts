import { VehicleBrandVersion } from '../vehicles-brands/vehicle-brand-version.model';

export interface VehicleModelVersion {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  brand: VehicleBrandVersion;
}
