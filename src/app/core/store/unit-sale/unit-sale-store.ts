import { computed, inject, Injectable } from '@angular/core';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { UnitSaleService } from '../../services/unit-sale-service';
import { UnitSaleQueryCache } from '../../models/units-sale/unit-sale-query-cache.model';
import { SelectOption } from '../../models/design-system/select-option.model';
import { map } from 'rxjs';
import { GeneralOption } from '../../models/generals/general-options-response.model';

@Injectable({
  providedIn: 'root',
})
export class UnitSaleStore extends OptionCacheStore<SelectOption, UnitSaleQueryCache> {
  private readonly service = inject(UnitSaleService);

  protected readonly INITIAL_KEY = 'unit-sales:initial';
  protected readonly QUERY_KEY = 'unit-sales:query';

  readonly manufacturerOptions = computed(() => this.options()?.data ?? []);

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getOptions(query).pipe(
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

  protected isSameCachedQuery(cached: UnitSaleQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: UnitSaleQueryCache): getAllResponse<SelectOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<SelectOption[]>,
  ): UnitSaleQueryCache {
    return {
      query,
      response,
    };
  }
}
