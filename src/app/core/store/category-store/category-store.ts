import { inject, Injectable } from '@angular/core';
import { CategoryService } from '../../services/category-service';
import { CategoryOption } from '../../models/catetories/category-options.model';
import { CategoryQueryCache } from '../../models/catetories/category-query-cache.model';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { isSameQuery } from '../../services/query-service';
import { OptionCacheStore } from '../base/option-cache-store';
import { AutocompleteOption } from '../../models/design-system/auto-complete.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryStore extends OptionCacheStore<AutocompleteOption, CategoryQueryCache> {
  private readonly service = inject(CategoryService);

  protected readonly INITIAL_KEY = 'categories:initial';
  protected readonly QUERY_KEY = 'categories:query';

  protected fetchOptions(query: GeneralOptionQuery) {
    return this.service.getOptions(query).pipe(
      map((r: getAllResponse<CategoryOption[]>) => ({
        ...r,
        data: r.data.map((option: CategoryOption) => ({
          ...option,
          disabled: false,
        })),
      })),
    );
  }

  protected isSameCachedQuery(cached: CategoryQueryCache, query: GeneralOptionQuery): boolean {
    return isSameQuery(cached.query, query);
  }

  protected getCachedResponse(cached: CategoryQueryCache): getAllResponse<AutocompleteOption[]> {
    return cached.response;
  }

  protected createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<AutocompleteOption[]>,
  ): CategoryQueryCache {
    return {
      query,
      response,
    };
  }
}
