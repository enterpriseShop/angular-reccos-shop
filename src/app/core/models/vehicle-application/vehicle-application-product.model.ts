import { EntityReference } from '../generals/entity-reference';

export interface ProductVehicleApplication {
  id: string;
  manufacturer: EntityReference;
  model: string;
  year_from: number;
  year_to: number | null;
  engine: string | null;
  details: string | null;
  created_at?: string;
  updated_at?: string;
}
