import { AutocompleteOption } from '../design-system/auto-complete.model';
import { getAllResponse } from '../generals/general-responses-list.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';

export interface CategoryQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<AutocompleteOption[]>;
}
