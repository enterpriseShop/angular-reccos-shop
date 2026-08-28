import { inject, Injectable } from '@angular/core';
import { ManufacturerService } from '../../services/manufacture-service';
import { ManufacturerQueryCache } from '../../models/manufactureres/manufacturer-query-cache.model';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { map } from 'rxjs';
import { GeneralOption } from '../../models/generals/general-options-response.model';
import { AutocompleteOption } from '../../models/design-system/auto-complete.model';

@Injectable({
  providedIn: 'root',
})
export class ManufacturerStore extends OptionCacheStore<
  AutocompleteOption,
  ManufacturerQueryCache
> {
  private readonly service = inject(ManufacturerService);

  protected readonly INITIAL_KEY = 'manufacturers:initial';
  protected readonly QUERY_KEY = 'manufacturers:query';

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getOptions(query).pipe(
      map((r: getAllResponse<GeneralOption[]>) => ({
        ...r,
        data: r.data.map((option: GeneralOption) => ({
          ...option,
          disabled: false,
          icon: 'chevrons-right',
          hasSubOptions: true,
          description: option.sublabel,
        })),
      })),
    );
  }

  protected isSameCachedQuery(cached: ManufacturerQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(
    cached: ManufacturerQueryCache,
  ): getAllResponse<AutocompleteOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<AutocompleteOption[]>,
  ): ManufacturerQueryCache {
    return {
      query,
      response,
    };
  }
}
