// oem-code-query-cache.model.ts

import { GeneralOptionQuery } from '../generals/general-option-query.model';
import { PaginatedResponse } from '../pagination/pagination.model';
import { OemCode } from './oem-codes.model';

export interface OemCodeQueryCache {
  query: GeneralOptionQuery;
  response: PaginatedResponse<OemCode>;
}
