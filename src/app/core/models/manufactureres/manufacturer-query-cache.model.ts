import { getAllResponse } from '../generals/general-responses-list.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';
import { AutocompleteOption } from '../design-system/auto-complete.model';

export interface ManufacturerQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<AutocompleteOption[]>;
}
