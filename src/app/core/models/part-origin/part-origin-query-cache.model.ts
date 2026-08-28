import { SelectOption } from '../design-system/select-option.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';
import { getAllResponse } from '../generals/general-responses-list.model';

export interface PartOriginQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<SelectOption[]>;
}
