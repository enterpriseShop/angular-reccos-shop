import { inject, Injectable } from '@angular/core';
import { CategoryStore } from '../store/category-store/category-store';
import { ManufacturerStore } from '../store/manufacturer-store/manufacturer-store';
import { OemCodeStore } from '../store/oem-code-store/oem-code-store';
import { StatusStore } from '../store/status-store/status-store';
import { UnitSaleStore } from '../store/unit-sale/unit-sale-store';
import { WarehouseStore } from '../store/warehouse/warehouse-store';
import { PartOriginStore } from '../store/part-origin/part-origin-store';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private readonly statusStore = inject(StatusStore);
  private readonly oemCodeStore = inject(OemCodeStore);
  private readonly categoryStore = inject(CategoryStore);
  private readonly unitSaleStore = inject(UnitSaleStore);
  private readonly warehouseStore = inject(WarehouseStore);
  private readonly partOriginStore = inject(PartOriginStore);
  private readonly manufacturerStore = inject(ManufacturerStore);

  async initialize(): Promise<void> {
    await Promise.all([
      this.oemCodeStore.loadInitial(),
      this.statusStore.loadInitialOptions(),
      this.unitSaleStore.loadInitialOptions(),
      this.categoryStore.loadInitialOptions(),
      this.warehouseStore.loadInitialOptions(),
      this.partOriginStore.loadInitialOptions(),
      this.manufacturerStore.loadInitialOptions(),
    ]);
  }
}
