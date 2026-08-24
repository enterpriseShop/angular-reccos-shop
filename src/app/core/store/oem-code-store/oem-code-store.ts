import { Injectable, inject } from '@angular/core';
import { isSameQuery } from '../../services/query-service';
import { PaginatedCacheStore } from '../base/paginated-cache-store';
import { OemCode } from '../../models/oem-codes/oem-codes.model';
import { PaginatedResponse } from '../../models/pagination/pagination.model';
import { OemCodeQueryCache } from '../../models/oem-codes/oem-codes-query-cache.model';
import { OemCodeService } from '../../services/code-oem-service';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';

@Injectable({
  providedIn: 'root',
})
export class OemCodeStore extends PaginatedCacheStore<
  OemCode,
  PaginatedResponse<OemCode>,
  OemCodeQueryCache
> {
  private readonly service = inject(OemCodeService);

  protected readonly INITIAL_KEY = 'oem-codes:initial';
  protected readonly QUERY_KEY = 'oem-codes:query';

  protected fetch(query: GeneralOptionQuery) {
    return this.service.getByManufacturer(query);
  }

  protected isDefaultQuery(query: GeneralOptionQuery): boolean {
    return query.active == null;
  }

  protected extractData(response: PaginatedResponse<OemCode>): OemCode[] {
    return response.data ?? [];
  }

  protected isSameCachedQuery(cached: OemCodeQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected extractCachedData(cached: OemCodeQueryCache): OemCode[] {
    return cached.response.data ?? [];
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: PaginatedResponse<OemCode>,
  ): OemCodeQueryCache {
    return {
      query,
      response,
    };
  }
}
