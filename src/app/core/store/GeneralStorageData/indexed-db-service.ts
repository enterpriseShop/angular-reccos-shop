import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { CacheEntry } from '../../models/indexed-db/indexed-db.model';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private readonly DB_NAME = 'reccos_shop_db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'cache';

  private readonly platformId = inject(PLATFORM_ID);

  private readonly dbPromise = this.createDbPromise();

  private createDbPromise(): Promise<IDBDatabase | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(null);
    }

    return this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const db = await this.dbPromise;

    if (!db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        if (entry.expiresAt <= Date.now()) {
          store.delete(key);
          resolve(null);
          return;
        }

        resolve(entry);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async set<T>(key: string, data: T, ttlMs: number, version = 1): Promise<void> {
    const db = await this.dbPromise;

    if (!db) {
      return;
    }

    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
      version,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(entry, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.dbPromise;

    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;

    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
