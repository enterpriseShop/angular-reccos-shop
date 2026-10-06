import { inject, Injectable } from '@angular/core';
import { OptionCacheStore } from '../../base/option-cache-store';
import { AutocompleteOption } from '../../../models/design-system/auto-complete.model';
import { VehicleModelQueryCache } from '../../../models/vehicles-model/vehicle-model-query-cache.model';
import { VehicleModelService } from '../../../services/vehicle-model';
import { GeneralOptionQuery } from '../../../models/generals/general-option-query.model';
import { getAllResponse } from '../../../models/generals/general-responses-list.model';
import { GeneralOption } from '../../../models/generals/general-options-response.model';
import { map } from 'rxjs';
import { isSameQuery } from '../../../services/query-service';

@Injectable({
  providedIn: 'root',
})
export class VehicleModelStore extends OptionCacheStore<
  AutocompleteOption,
  VehicleModelQueryCache
> {
  private readonly service = inject(VehicleModelService);

  protected readonly INITIAL_KEY = 'vehicle-models:initial';
  protected readonly QUERY_KEY = 'vehicle-models:query';

  protected fetchOptions(query: Partial<GeneralOptionQuery>) {
    return this.service.getOptions(query).pipe(
      map((r: getAllResponse<GeneralOption[]>) => ({
        ...r,
        data: r.data.map(
          (option: GeneralOption) =>
            ({
              ...option,
              disabled: false,
            }) as AutocompleteOption,
        ),
      })),
    );
  }

  protected isSameCachedQuery(cached: VehicleModelQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(
    cached: VehicleModelQueryCache,
  ): getAllResponse<AutocompleteOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<AutocompleteOption[]>,
  ): VehicleModelQueryCache {
    return {
      query,
      response,
    };
  }
  protected getOptionKey(option: AutocompleteOption): string {
    return option.value;
  }
}
