import { inject, Injectable } from '@angular/core';
import { ManufacturerStore } from '../store/manufacturer-store/manufacturer-store';

@Injectable({
  providedIn: 'root',
})
export class InitialDataLoader {
  private readonly manufacturerStore = inject(ManufacturerStore);

  // categoryStore
  // countryStore
  // etc.

  load(): void {
    // this.manufacturerStore.loadInitialOptions();
    // this.categoryStore.loadInitialOptions();
    // this.countryStore.loadInitialOptions();
    // ...
  }
}

// 11. A única ressalva: duas abas abrindo simultaneamente
