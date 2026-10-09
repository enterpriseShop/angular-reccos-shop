import { SelectOption } from '../design-system/select-option.model';
import { getAllResponse } from '../generals/general-responses-list.model';
import { GeneralOptionQuery } from '../generals/general-option-query.model';

export interface VehicleBrandQueryCache {
  query: GeneralOptionQuery;
  response: getAllResponse<SelectOption[]>;
}
