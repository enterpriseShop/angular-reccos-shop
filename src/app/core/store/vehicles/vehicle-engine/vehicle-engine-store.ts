import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { OptionCacheStore } from '../../base/option-cache-store';
import { GeneralOptionQuery } from '../../../models/generals/general-option-query.model';
import { SelectOption } from '../../../models/design-system/select-option.model';
import { VehicleEngineService } from '../../../services/vehicle-engine';
import { getAllResponse } from '../../../models/generals/general-responses-list.model';
import { GeneralOption } from '../../../models/generals/general-options-response.model';
import { isSameQuery } from '../../../services/query-service';
import { VehicleEngineFilter } from '../../../models/vehicles-engine/vehicle-engine-filters.model';
import { VehicleEngineQueryCache } from '../../../models/vehicles-engine/vehicle-engine-query-cache.model';
import { VehicleVersionQueryCache } from '../../../models/vehicles-version/vehicle-version-query-cache.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleEngineStore extends OptionCacheStore<SelectOption, VehicleEngineQueryCache> {
  private readonly service = inject(VehicleEngineService);

  protected readonly INITIAL_KEY = 'vehicle-engine:initial';
  protected readonly QUERY_KEY = 'vehicle-engine:query';

  protected fetchOptions(query: Partial<VehicleEngineFilter>) {
    return this.service.getOptions(query).pipe(
      map((r: getAllResponse<GeneralOption[]>) => ({
        ...r,
        data: r.data.map(
          (option: GeneralOption) =>
            ({
              ...option,
              disabled: false,
            }) as SelectOption,
        ),
      })),
    );
  }

  protected isSameCachedQuery(
    cached: VehicleVersionQueryCache,
    query: GeneralOptionQuery,
  ): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: VehicleVersionQueryCache): getAllResponse<SelectOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<SelectOption[]>,
  ): VehicleVersionQueryCache {
    return {
      query,
      response,
    };
  }
  protected getOptionKey(option: SelectOption): string {
    return option.value;
  }
}
