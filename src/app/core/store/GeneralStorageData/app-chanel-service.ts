import { Injectable } from '@angular/core';
import { CacheChangedEvent } from '../../models/indexed-db/indexed-db.model';

@Injectable({
  providedIn: 'root',
})
export class AppChannelService {
  private readonly channel = new BroadcastChannel('reccos_shop_cache');

  private readonly listeners = new Map<string, Set<() => void>>();

  constructor() {
    this.channel.onmessage = (event: MessageEvent<CacheChangedEvent>) => {
      const message = event.data;

      const callbacks = this.listeners.get(message.key);

      callbacks?.forEach((callback) => callback());
    };
  }

  notifyUpdated(key: string): void {
    this.channel.postMessage({
      type: 'updated',
      key,
    } satisfies CacheChangedEvent);
  }

  notifyRemoved(key: string): void {
    this.channel.postMessage({
      type: 'removed',
      key,
    } satisfies CacheChangedEvent);
  }

  subscribe(key: string, callback: () => void): () => void {
    let callbacks = this.listeners.get(key);

    if (!callbacks) {
      callbacks = new Set();
      this.listeners.set(key, callbacks);
    }

    callbacks.add(callback);

    return () => {
      callbacks?.delete(callback);

      if (callbacks?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }
}
