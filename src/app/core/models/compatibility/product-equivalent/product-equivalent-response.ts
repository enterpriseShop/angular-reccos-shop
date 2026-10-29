import { EntityReference } from '../../generals/entity-reference';

export interface ProductEquivalentResponse extends Record<string, unknown> {
  id: string;
  observation: string | null;
  product: EntityReference;
  equivalent_product: EntityReference;
}
