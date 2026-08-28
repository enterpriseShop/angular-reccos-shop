import { EntityReference } from '../generals/entity-reference';

export interface ProductEquivalent {
  id: string;
  observation: string | null;
  product: EntityReference;
  equivalent_product: EntityReference;
  status?: boolean; // remover após produtos equivalentes
}
