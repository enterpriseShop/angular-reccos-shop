import { SelectOption } from '../design-system/select-option.model';
import { getAllResponse } from '../generals/general-responses-list.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';

export interface UnitSaleQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<SelectOption[]>;
}
