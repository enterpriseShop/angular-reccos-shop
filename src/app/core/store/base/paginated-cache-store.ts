import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { AppCacheService } from '../GeneralStorageData/app-cache-service';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { createDefaultQuery } from '../../services/query-service';

@Injectable()
export abstract class PaginatedCacheStore<TData, TResponse, TQueryCache> {
  protected readonly cache = inject(AppCacheService);

  protected abstract isDefaultQuery(query: GeneralOptionQuery): boolean;

  protected abstract extractData(response: TResponse): TData[];

  protected abstract isSameCachedQuery(cached: TQueryCache, query: GeneralOptionQuery): boolean;

  protected abstract extractCachedData(cached: TQueryCache): TData[];

  protected abstract createQueryCache(query: GeneralOptionQuery, response: TResponse): TQueryCache;

  protected readonly CACHE_TTL = 1000 * 60 * 60 * 6;

  protected abstract readonly INITIAL_KEY: string;
  protected abstract readonly QUERY_KEY: string;

  protected abstract fetch(query: GeneralOptionQuery): Observable<TResponse>;

  protected readonly _data = signal<TData[]>([]);

  readonly data = this._data.asReadonly();

  protected readonly defaultQuery = createDefaultQuery();

  protected currentQuery = this.defaultQuery;

  constructor() {
    this.subscribeToCacheChanges();
  }

  async loadInitial(query: GeneralOptionQuery = this.defaultQuery): Promise<void> {
    this.currentQuery = query;

    const cached = await this.cache.get<TResponse>(this.INITIAL_KEY);

    if (cached) {
      this._data.set(this.extractData(cached));
      return;
    }

    this.loadFromApi(query, this.INITIAL_KEY);
  }

  async load(query: GeneralOptionQuery): Promise<void> {
    this.currentQuery = query;

    if (this.isDefaultQuery(query)) {
      await this.cache.remove(this.QUERY_KEY);
      await this.loadInitial();
      return;
    }

    await this.loadQuery(query);
  }

  private async loadQuery(query: GeneralOptionQuery): Promise<void> {
    const cached = await this.cache.get<TQueryCache>(this.QUERY_KEY);

    if (cached && this.isSameCachedQuery(cached, query)) {
      this._data.set(this.extractCachedData(cached));
      return;
    }

    this.fetch(query).subscribe({
      next: async (response) => {
        this._data.set(this.extractData(response));

        const cachedData = this.createQueryCache(query, response);

        await this.cache.set(this.QUERY_KEY, cachedData, this.CACHE_TTL);
      },

      error: () => {
        this._data.set([]);
      },
    });
  }

  private loadFromApi(query: GeneralOptionQuery, cacheKey: string): void {
    this.fetch(query).subscribe({
      next: async (response) => {
        this._data.set(this.extractData(response));

        await this.cache.set(cacheKey, response, this.CACHE_TTL);
      },

      error: () => {
        this._data.set([]);
      },
    });
  }

  private subscribeToCacheChanges(): void {
    this.cache.subscribe(this.INITIAL_KEY, async () => {
      if (!this.isDefaultQuery(this.currentQuery)) {
        return;
      }

      const cached = await this.cache.get<TResponse>(this.INITIAL_KEY);

      if (cached) {
        this._data.set(this.extractData(cached));
      }
    });
  }

  async clear(): Promise<void> {
    this._data.set([]);

    await this.cache.remove(this.INITIAL_KEY);
    await this.cache.remove(this.QUERY_KEY);
  }
}
