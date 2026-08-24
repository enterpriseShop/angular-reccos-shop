import { getAllResponse } from '../generals/general-responses-list.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';
import { SelectOption } from '../design-system/select-option.model';

export interface StatusQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<SelectOption[]>;
}
