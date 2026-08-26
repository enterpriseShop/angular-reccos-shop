import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { AppCacheService } from '../GeneralStorageData/app-cache-service';
import { GeneralOptionQuery } from '../../models/generals/general-option-query.model';
import { getAllResponse } from '../../models/generals/general-responses-list.model';
import { createDefaultQuery, isDefaultQuery } from '../../services/query-service';

@Injectable()
export abstract class OptionCacheStore<TOption, TQueryCache> {
  protected readonly cache = inject(AppCacheService);

  protected readonly CACHE_TTL = 1000 * 60 * 60 * 6;

  protected abstract readonly INITIAL_KEY: string;
  protected abstract readonly QUERY_KEY: string;

  /**
   * Responsável por buscar as opções na API.
   *
   * O Store concreto pode sobrescrever o retorno do serviço,
   * realizando aqui a adaptação necessária para TOption.
   */
  protected abstract fetchOptions(query: GeneralOptionQuery): Observable<getAllResponse<TOption[]>>;

  protected readonly _options = signal<getAllResponse<TOption[]> | null>(null);

  readonly options = this._options.asReadonly();

  /**
   * Lista pronta para ser consumida pela aplicação.
   */
  readonly optionList = computed(() => this._options()?.data ?? []);

  protected readonly defaultQuery = createDefaultQuery();

  protected currentQuery = this.defaultQuery;

  protected abstract isSameCachedQuery(cached: TQueryCache, query: GeneralOptionQuery): boolean;

  protected abstract getCachedResponse(cached: TQueryCache): getAllResponse<TOption[]>;

  protected abstract createQueryCache(
    query: GeneralOptionQuery,
    response: getAllResponse<TOption[]>,
  ): TQueryCache;

  constructor() {
    this.subscribeToCacheChanges();
  }

  /**
   * Hidrata o Store ao iniciar a aplicação.
   *
   * 1. Procura os dados iniciais no IndexedDB.
   * 2. Se encontrar, popula o Signal.
   * 3. Se não encontrar, busca na API e grava no cache.
   */
  async hydrate(): Promise<void> {
    const cached = await this.cache.get<getAllResponse<TOption[]>>(this.INITIAL_KEY);

    if (cached) {
      this._options.set(cached);
      return;
    }

    await this.loadFromApi(this.defaultQuery, this.INITIAL_KEY);
  }

  /**
   * Fluxo utilizado para buscas filtradas.
   *
   * Quando a consulta é a consulta padrão, volta a utilizar
   * os dados iniciais.
   */
  async loadOptions(query: GeneralOptionQuery): Promise<void> {
    this.currentQuery = query;

    if (isDefaultQuery(query)) {
      await this.cache.remove(this.QUERY_KEY);
      await this.hydrate();
      return;
    }

    await this.loadQuery(query);
  }

  /**
   * Carrega uma consulta específica.
   */
  private async loadQuery(query: GeneralOptionQuery): Promise<void> {
    const cached = await this.cache.get<TQueryCache>(this.QUERY_KEY);

    if (cached && this.isSameCachedQuery(cached, query)) {
      this._options.set(this.getCachedResponse(cached));

      return;
    }

    this.fetchOptions(query).subscribe({
      next: async (response) => {
        this._options.set(response);

        const cachedData = this.createQueryCache(query, response);

        await this.cache.set(this.QUERY_KEY, cachedData, this.CACHE_TTL);
      },

      error: () => {
        this._options.set(null);
      },
    });
  }

  /**
   * Busca dados na API e persiste no cache.
   */
  private async loadFromApi(query: GeneralOptionQuery, cacheKey: string): Promise<void> {
    this.fetchOptions(query).subscribe({
      next: async (response) => {
        this._options.set(response);

        await this.cache.set(cacheKey, response, this.CACHE_TTL);
      },

      error: () => {
        this._options.set(null);
      },
    });
  }

  /**
   * Mantém o Signal sincronizado quando outra instância da
   * aplicação altera o cache inicial.
   */
  private subscribeToCacheChanges(): void {
    this.cache.subscribe(this.INITIAL_KEY, async () => {
      if (!isDefaultQuery(this.currentQuery)) {
        return;
      }

      const cached = await this.cache.get<getAllResponse<TOption[]>>(this.INITIAL_KEY);

      if (cached) {
        this._options.set(cached);
      }
    });
  }

  /**
   * Limpa o estado do Store e os respectivos caches.
   */
  async clear(): Promise<void> {
    this._options.set(null);

    await this.cache.remove(this.INITIAL_KEY);
    await this.cache.remove(this.QUERY_KEY);
  }
}
