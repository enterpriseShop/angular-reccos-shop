import { computed, inject, Injectable } from '@angular/core';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { WarehouseQueryCache } from '../../models/warehouses/warehouse-query-cache.model';
import { WarehouseService } from '../../services/warehouse-service';
import { GeneralOption } from '../../models/generals/general-options-response.model';
import { SelectOption } from '../../models/design-system/select-option.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WarehouseStore extends OptionCacheStore<SelectOption, WarehouseQueryCache> {
  private readonly service = inject(WarehouseService);

  protected readonly INITIAL_KEY = 'warehouses:initial';
  protected readonly QUERY_KEY = 'warehouses:query';

  readonly warehouseOptions = computed(() => this.options()?.data ?? []);

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getOptions(query).pipe(
      map((response: getAllResponse<GeneralOption[]>) => {
        return {
          ...response,
          data: response.data.map((option: any) => ({
            value: option.id ?? option.value,
            label: option.label,
            sublabel: option.description ?? option.sublabel ?? '',
            disabled: false,
          })),
        };
      }),
    );
  }

  protected isSameCachedQuery(cached: WarehouseQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: WarehouseQueryCache): getAllResponse<SelectOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<SelectOption[]>,
  ): WarehouseQueryCache {
    return {
      query,
      response,
    };
  }
}
