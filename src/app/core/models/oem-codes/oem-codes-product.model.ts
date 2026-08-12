import { EntityReference } from '../generals/entity-reference';

export interface ProductOemCode {
  id: string;
  oem_code: string;
  manufacturer?: EntityReference;
  product?: EntityReference;
  created_at: string;
  updated_at: string;
  is_primary: boolean;
}
