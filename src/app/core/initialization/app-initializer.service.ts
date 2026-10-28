import { inject, Injectable } from '@angular/core';
import { CategoryStore } from '../store/category-store/category-store';
import { ManufacturerStore } from '../store/manufacturer-store/manufacturer-store';
import { OemCodeStore } from '../store/oem-code-store/oem-code-store';
import { StatusStore } from '../store/status-store/status-store';
import { UnitSaleStore } from '../store/unit-sale/unit-sale-store';
import { WarehouseStore } from '../store/warehouse/warehouse-store';
import { PartOriginStore } from '../store/part-origin/part-origin-store';
import { VehicleBrandStore } from '../store/vehicles/vehicle-brand/vehicle-brand-store';
import { VehicleModelStore } from '../store/vehicles/vehicle-model/vehicle-model-store';
import { VehicleVersionStore } from '../store/vehicles/vehicle-version/vehicle-version-store';
import { VehicleEngineStore } from '../store/vehicles/vehicle-engine/vehicle-engine-store';

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
  private readonly vehicleBrandStore = inject(VehicleBrandStore);
  private readonly vehicleModelStore = inject(VehicleModelStore);
  private readonly vehicleEngineStore = inject(VehicleEngineStore);
  private readonly vehicleVersionStore = inject(VehicleVersionStore);

  async initialize(): Promise<void> {
    await Promise.all([
      this.oemCodeStore.loadInitial(),
      this.statusStore.hydrate(),
      this.unitSaleStore.hydrate(),
      this.categoryStore.hydrate(),
      this.warehouseStore.hydrate(),
      this.partOriginStore.hydrate(),
      this.manufacturerStore.hydrate(),
      this.vehicleBrandStore.hydrate(),
      this.vehicleModelStore.hydrate(),
      this.vehicleEngineStore.hydrate(),
      this.vehicleVersionStore.hydrate(),
    ]);
  }
}
