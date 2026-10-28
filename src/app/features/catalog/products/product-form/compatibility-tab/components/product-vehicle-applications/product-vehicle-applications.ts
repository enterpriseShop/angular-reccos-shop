import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
} from '@angular/core';
import { ButtonComponent } from '../../../../../../../design-system/button/button';
import { DrawerComponent } from '../../../../../../../design-system/drawer/drawer';
import { AppIconComponent } from '../../../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../../../design-system/pagination/pagination';
import { VehicleApplicationFormComponent } from '../../../../../../vehicles/vehicle-applications/vehicle-application-form/vehicle-application-form';
import { VehicleBrandStore } from '../../../../../../../core/store/vehicles/vehicle-brand/vehicle-brand-store';
import { VehicleBrandService } from '../../../../../../../core/services/vehicle-brand';
import { VehicleApplicationService } from '../../../../../../../core/services/vehicle-application';
import { ProductVehicleApplication } from '../../../../../../../core/models/vehicle-application/vehicle-application-product.model';
import { VehicleApplicationResponse } from '../../../../../../../core/models/vehicle-application/vehicle-application.model';
import { SelectOption } from '../../../../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-product-vehicle-applications',
  standalone: true,
  imports: [
    DrawerComponent,
    ButtonComponent,
    AppIconComponent,
    PaginationComponent,
    VehicleApplicationFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-vehicle-applications.html',
})
export class ProductVehicleApplicationsComponent {
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleAppService = inject(VehicleApplicationService);

  // Inputs
  readonly vehicleApplications = input<ProductVehicleApplication[]>([]);
  readonly isReadOnly = input<boolean>(false);

  // Outputs
  readonly addVehicleApplication = output<void>();
  readonly toggleVehicleStatus = output<string>();
  readonly removeVehicleApplication = output<string>();
  readonly vehicleApplicationsChange = output<ProductVehicleApplication[]>();
  readonly vehicleApplicationIdsChange = output<string[]>();

  // State
  readonly isNewVehicleDrawerOpen = signal<boolean>(false);
  readonly isVehicleLinkDrawerOpen = signal<boolean>(false);
  readonly loadingVehicleApplications = signal<boolean>(false);
  readonly availableVehicleApplications = signal<VehicleApplicationResponse[]>([]);
  readonly vehicleSearchQuery = signal<string>('');
  readonly selectedVehicleBrandFilter = signal<string>('all');

  // Pagination for main table
  readonly vehiclePage = signal<number>(1);
  readonly vehiclePageSize = signal<number>(5);
  readonly vehiclePaginated = computed(() => {
    const list = this.vehicleApplications();
    const start = (this.vehiclePage() - 1) * this.vehiclePageSize();
    return list.slice(start, start + this.vehiclePageSize());
  });

  // Vehicle Link Drawer Pagination
  readonly linkDrawerPage = signal<number>(1);
  readonly linkDrawerPageSize = signal<number>(6);

  readonly vehicleBrandOptions = computed<SelectOption[]>(() => {
    return this.vehicleBrandStore.optionList();
  });

  readonly filteredAvailableVehicleApps = computed<VehicleApplicationResponse[]>(() => {
    return [];
  });

  readonly paginatedAvailableVehicleApps = computed(() => {
    const list = this.filteredAvailableVehicleApps();
    const start = (this.linkDrawerPage() - 1) * this.linkDrawerPageSize();
    return list.slice(start, start + this.linkDrawerPageSize());
  });

  onToggleVehicleStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleVehicleStatus.emit(id);
  }

  onRemoveVehicleApplication(id: string): void {
    if (this.isReadOnly()) return;
    const current = this.vehicleApplications();
    const updated = current.filter((v) => v.id !== id);
    this.vehicleApplicationIdsChange.emit(updated.map((u) => u.id));
    this.removeVehicleApplication.emit(id);
  }

  openVehicleLinkDrawer(): void {
    if (this.isReadOnly()) return;
    this.isVehicleLinkDrawerOpen.set(true);
    this.loadAvailableVehicleApps();
  }

  closeVehicleLinkDrawer(): void {
    this.isVehicleLinkDrawerOpen.set(false);
  }

  openNewVehicleDrawer(): void {
    if (this.isReadOnly()) return;
    this.isNewVehicleDrawerOpen.set(true);
  }

  closeNewVehicleDrawer(): void {
    this.isNewVehicleDrawerOpen.set(false);
  }

  loadAvailableVehicleApps(): void {
    // Implement as needed
  }

  isVehicleAppLinked(appId: string): boolean {
    return this.vehicleApplications().some((v) => v.id === appId);
  }

  toggleVehicleLink(app: VehicleApplicationResponse): void {
    // Implement as needed
    console.log(app);
  }

  onNewVehicleSaved(newApp: VehicleApplicationResponse): void {
    this.closeNewVehicleDrawer();
    console.log(newApp);
  }
}
