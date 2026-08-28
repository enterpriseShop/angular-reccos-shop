import { computed, inject, Injectable } from '@angular/core';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { StatusService } from '../../services/status-service';
import { StatusQueryCache } from '../../models/status/status-query-cache.model';
import { SelectOption } from '../../models/design-system/select-option.model';
import { map } from 'rxjs';
import { GeneralOption } from '../../models/generals/general-options-response.model';

@Injectable({
  providedIn: 'root',
})
export class StatusStore extends OptionCacheStore<SelectOption, StatusQueryCache> {
  private readonly service = inject(StatusService);

  protected readonly INITIAL_KEY = 'statuses:initial';
  protected readonly QUERY_KEY = 'statuses:query';

  readonly statusOptions = computed(() => this.options()?.data ?? []);

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getOptions('PRODUCT', query).pipe(
      map((response: getAllResponse<GeneralOption[]>) => {
        return {
          ...response,
          data: response.data.map((option: GeneralOption) => ({
            ...option,
            disabled: false,
          })),
        };
      }),
    );
  }

  protected isSameCachedQuery(cached: StatusQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: StatusQueryCache): getAllResponse<SelectOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<SelectOption[]>,
  ): StatusQueryCache {
    return {
      query,
      response,
    };
  }
}
