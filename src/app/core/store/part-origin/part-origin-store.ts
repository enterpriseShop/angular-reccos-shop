import { inject, Injectable } from '@angular/core';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { PartOriginService } from '../../services/part-origins-service';
import { PartOriginResponse } from '../../models/part-origin/part-origin-response';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { PartOriginQueryCache } from '../../models/part-origin/part-origin-query-cache.model';
import { SelectOption } from '../../models/design-system/select-option.model';
import { map } from 'rxjs';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { PaginatedResponse } from '../../models/pagination/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class PartOriginStore extends OptionCacheStore<SelectOption, PartOriginQueryCache> {
  private readonly service = inject(PartOriginService);

  protected readonly QUERY_KEY = 'part-origin:query';
  protected readonly INITIAL_KEY = 'part-origin:initial';

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getAll(query).pipe(
      map((res: PaginatedResponse<PartOriginResponse>) => ({
        success: res.success,
        message: res.message,
        data: res.data.map((item: PartOriginResponse) => ({
          label: item.name,
          value: item.id,
          disabled: false,
          sublabel: item.description,
        })),
      })),
    );
  }

  protected isSameCachedQuery(cached: PartOriginQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: PartOriginQueryCache): getAllResponse<SelectOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<SelectOption[]>,
  ): PartOriginQueryCache {
    return {
      query,
      response,
    };
  }
}
