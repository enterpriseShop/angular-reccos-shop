import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db-service';
import { AppChannelService } from './app-chanel-service';
@Injectable({
  providedIn: 'root',
})
export class AppCacheService {
  private readonly db = inject(IndexedDbService);
  private readonly channel = inject(AppChannelService);

  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.db.get<T>(key);

      return entry?.data ?? null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, data: T, ttlMs: number, version = 1): Promise<void> {
    try {
      await this.db.set(key, data, ttlMs, version);

      this.channel.notifyUpdated(key);
    } catch {
      // Cache nunca deve impedir a aplicação de funcionar.
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.db.remove(key);

      this.channel.notifyRemoved(key);
    } catch {
      // Cache nunca deve impedir a aplicação de funcionar.
    }
  }

  subscribe(key: string, callback: () => void): () => void {
    return this.channel.subscribe(key, callback);
  }
}
