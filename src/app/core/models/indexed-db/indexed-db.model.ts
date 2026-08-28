export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  version: number;
}

export interface CacheChangedEvent {
  type: 'updated' | 'removed';
  key: string;
}
