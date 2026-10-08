import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { OptionCacheStore } from '../../base/option-cache-store';
import { AutocompleteOption } from '../../../models/design-system/auto-complete.model';
import { GeneralOptionQuery } from '../../../models/generals/general-option-query.model';
import { VehicleBrandService } from '../../../services/vehicle-brand';
import { getAllResponse } from '../../../models/generals/general-responses-list.model';
import { GeneralOption } from '../../../models/generals/general-options-response.model';
import { isSameQuery } from '../../../services/query-service';
import { VehicleBrandQueryCache } from '../../../models/vehicles-brands/vehicle-brand-query-cache.model';
import { VehicleApplicationFilters } from '../../../models/vehicle-application/vehicle-application.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleBrandStore extends OptionCacheStore<
  AutocompleteOption,
  VehicleBrandQueryCache
> {
  private readonly service = inject(VehicleBrandService);

  protected readonly INITIAL_KEY = 'vehicle-brands:initial';
  protected readonly QUERY_KEY = 'vehicle-brands:query';

  protected fetchOptions(query: Partial<GeneralOptionQuery>) {
    return this.service.getOptions(query as any).pipe(
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

  protected isSameCachedQuery(cached: VehicleBrandQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(
    cached: VehicleBrandQueryCache,
  ): getAllResponse<AutocompleteOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<AutocompleteOption[]>,
  ): VehicleBrandQueryCache {
    return {
      query,
      response,
    };
  }
  protected getOptionKey(option: AutocompleteOption): string {
    return option.value;
  }
}
