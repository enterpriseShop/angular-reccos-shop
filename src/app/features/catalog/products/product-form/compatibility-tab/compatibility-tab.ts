import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../design-system/pagination/pagination';
import { DrawerComponent } from '../../../../../design-system/drawer/drawer';
import { VehicleApplicationService } from '../../../../../core/services/vehicle-application';
import { VehicleBrandService } from '../../../../../core/services/vehicle-brand';
import { OemCodeFormComponent } from '../../../oem-code/oem-code-form/oem-code-form';
import { VehicleApplicationFormComponent } from '../../../../vehicles/vehicle-applications/vehicle-application-form/vehicle-application-form';
import { FormTab } from '../../../models/product-workspace.model';
import {
  OemCode,
  ProductOemCodeResource,
} from '../../../../../core/models/oem-codes/oem-codes.model';
import { ProductAdditionalCodeSummary } from '../../../../../core/models/additional-codes/additional-codes-product.model';
import { ProductEquivalent } from '../../../../../core/models/equivalent/equivalent-products.model';
import { ProductVehicleApplication } from '../../../../../core/models/vehicle-application/vehicle-application-product.model';
import { VehicleApplicationResponse } from '../../../../../core/models/vehicle-application/vehicle-application.model';
import { VehicleBrandStore } from '../../../../../core/store/vehicles/vehicle-brand/vehicle-brand-store';
import { SelectOption } from '../../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-product-compatibility-tab',
  standalone: true,
  imports: [
    DatePipe,
    ButtonComponent,
    AppIconComponent,
    PaginationComponent,
    DrawerComponent,
    OemCodeFormComponent,
    VehicleApplicationFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compatibility-tab.html',
})
export class ProductCompatibilityTabComponent {
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleAppService = inject(VehicleApplicationService);

  readonly activeTab = input<FormTab>();
  readonly oemCodes = input<OemCode[]>([]);
  readonly selectedOemCodeIds = input<string[]>([]);
  readonly equivalentProducts = input<ProductEquivalent[]>([]);
  readonly registeredOemCodes = input<ProductOemCodeResource[]>([]);
  readonly productCodes = input<ProductAdditionalCodeSummary[]>([]);
  readonly vehicleApplications = input<ProductVehicleApplication[]>([]);
  readonly dynamicallyCreatedOemCodes = signal<ProductOemCodeResource[]>([]);
  readonly availableVehicleApplications = signal<VehicleApplicationResponse[]>([]);

  readonly vehicleSearchQuery = signal<string>('');
  readonly selectedVehicleBrandFilter = signal<string>('all');

  readonly isReadOnly = input<boolean>(false);
  readonly isOemDrawerOpen = signal<boolean>(false);
  readonly isNewVehicleDrawerOpen = signal<boolean>(false);
  readonly isVehicleLinkDrawerOpen = signal<boolean>(false);
  readonly loadingVehicleApplications = signal<boolean>(false);

  readonly vehicleBrandOptions = computed<SelectOption[]>(() => {
    return this.vehicleBrandStore.optionList();
  });

  // Vehicle Link Drawer Pagination
  readonly linkDrawerPage = signal<number>(1);
  readonly linkDrawerPageSize = signal<number>(6);

  // Outputs for other tabs
  readonly addProductCode = output<void>();
  readonly removeProductCode = output<string>();
  readonly toggleProductCodeStatus = output<string>();

  readonly addEquivalent = output<void>();
  readonly removeEquivalent = output<string>();
  readonly toggleEquivalentStatus = output<string>();

  readonly addVehicleApplication = output<void>();
  readonly toggleVehicleStatus = output<string>();
  readonly removeVehicleApplication = output<string>();

  readonly oemCodeIdsChange = output<string[]>();
  readonly selectedOemCodeIdsChange = output<string[]>();
  readonly selectedVehicleApplicationIds = input<string[]>([]);

  readonly vehicleApplicationIdsChange = output<string[]>();
  readonly vehicleApplicationsChange = output<VehicleApplicationResponse[]>();

  // OEM Search & Filter Signals
  readonly oemSearchQuery = signal<string>('');
  readonly selectedMfrFilter = signal<string>('all');

  // OEM Pagination
  readonly oemPage = signal<number>(1);
  readonly oemPageSize = signal<number>(8);

  // Consolidated registered OEM codes list with fallbacks and newly created items
  readonly availableOemCodes = computed<ProductOemCodeResource[]>(() => {
    const dynamic = this.dynamicallyCreatedOemCodes();
    let baseList: ProductOemCodeResource[] = [];

    const reg = this.registeredOemCodes();
    if (reg && reg.length > 0) {
      baseList = reg;
    }
    // else {
    //   const legacy = this.oemCodes();
    //   if (legacy && legacy.length > 0) {
    //     baseList = legacy.map((item) => ({
    //       id: item.id || item.oem_code,
    //       oem_code: item.oem_code || item.id,
    //       manufacturer: { id: '', name: item.manufacturer || 'Montadora' },
    //     }));
    //   } else {
    //     baseList = INITIAL_REGISTERED_OEM_CODES;
    //   }
    // }

    if (dynamic.length === 0) return baseList;

    // Merge dynamic items ensuring no duplicate IDs
    const map = new Map<string, ProductOemCodeResource>();
    dynamic.forEach((item) => map.set(item.id, item));
    baseList.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values());
  });

  openNewOemDrawer(): void {
    if (this.isReadOnly()) return;
    this.isOemDrawerOpen.set(true);
  }

  closeOemDrawer(): void {
    this.isOemDrawerOpen.set(false);
  }

  onNewOemSaved(newOem: ProductOemCodeResource): void {
    this.dynamicallyCreatedOemCodes.update((list) => [newOem, ...list]);
    // Auto-select the newly created OEM code
    const current = this.currentSelectedOemIds();
    if (!current.includes(newOem.id)) {
      const updated = [newOem.id, ...current];
      this.selectedOemCodeIdsChange.emit(updated);
      this.oemCodeIdsChange.emit(updated);
    }
  }

  // Effective selected OEM Code IDs
  readonly currentSelectedOemIds = computed<string[]>(() => {
    const ids = this.selectedOemCodeIds();
    if (ids && ids.length > 0) {
      return ids;
    }
    const legacy = this.oemCodes();
    if (legacy && legacy.length > 0) {
      return legacy.map((o) => o.id).filter(Boolean);
    }
    return ['uuid-oem-code-1', 'uuid-oem-code-2'];
  });

  // Unique manufacturers list for search filters
  readonly uniqueManufacturers = computed<string[]>(() => {
    const list = this.availableOemCodes();
    const set = new Set<string>();
    list.forEach((item) => {
      if (item.manufacturer?.name) {
        set.add(item.manufacturer.name);
      }
    });
    return Array.from(set).sort();
  });

  // Filtered OEM codes based on search query and manufacturer filter
  readonly filteredOemCodes = computed<ProductOemCodeResource[]>(() => {
    const query = this.oemSearchQuery().toLowerCase().trim();
    const mfrFilter = this.selectedMfrFilter();
    const list = this.availableOemCodes();

    return list.filter((item) => {
      const codeStr = (item.oem_code || '').toLowerCase();
      const mfrName = (item.manufacturer?.name || '').toLowerCase();

      const matchesQuery = !query || codeStr.includes(query) || mfrName.includes(query);
      const matchesMfr = mfrFilter === 'all' || mfrName === mfrFilter.toLowerCase();

      return matchesQuery && matchesMfr;
    });
  });

  // Paginated OEM list
  readonly oemPaginated = computed<ProductOemCodeResource[]>(() => {
    const list = this.filteredOemCodes();
    const start = (this.oemPage() - 1) * this.oemPageSize();
    return list.slice(start, start + this.oemPageSize());
  });

  // Helper: check if an OEM code ID is selected
  isOemSelected(id: string): boolean {
    return this.currentSelectedOemIds().includes(id);
  }

  // Toggle selection for a single OEM code
  toggleOemSelection(id: string): void {
    if (this.isReadOnly()) return;
    const current = [...this.currentSelectedOemIds()];
    const index = current.indexOf(id);
    let updated: string[];

    if (index > -1) {
      updated = current.filter((item) => item !== id);
    } else {
      updated = [...current, id];
    }

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  // Select all currently visible OEM codes
  selectAllVisibleOem(): void {
    if (this.isReadOnly()) return;
    const currentSet = new Set(this.currentSelectedOemIds());
    this.filteredOemCodes().forEach((item) => currentSet.add(item.id));
    const updated = Array.from(currentSet);

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  // Deselect all currently visible OEM codes
  deselectAllOem(): void {
    if (this.isReadOnly()) return;
    const visibleIds = new Set(this.filteredOemCodes().map((i) => i.id));
    const updated = this.currentSelectedOemIds().filter((id) => !visibleIds.has(id));

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  onOemSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.oemSearchQuery.set(val);
    this.oemPage.set(1);
  }

  clearOemSearch(): void {
    this.oemSearchQuery.set('');
    this.oemPage.set(1);
  }

  setMfrFilter(mfr: string): void {
    this.selectedMfrFilter.set(mfr);
    this.oemPage.set(1);
  }

  // Other tabs pagination
  readonly productCodesPage = signal<number>(1);
  readonly productCodesPageSize = signal<number>(5);
  readonly productCodesPaginated = computed(() => {
    const list = this.productCodes();
    const start = (this.productCodesPage() - 1) * this.productCodesPageSize();
    return list.slice(start, start + this.productCodesPageSize());
  });

  readonly equivalentPage = signal<number>(1);
  readonly equivalentPageSize = signal<number>(5);
  readonly equivalentPaginated = computed(() => {
    const list = this.equivalentProducts();
    const start = (this.equivalentPage() - 1) * this.equivalentPageSize();
    return list.slice(start, start + this.equivalentPageSize());
  });

  readonly vehiclePage = signal<number>(1);
  readonly vehiclePageSize = signal<number>(5);
  readonly vehiclePaginated = computed(() => {
    const list = this.vehicleApplications();
    const start = (this.vehiclePage() - 1) * this.vehiclePageSize();
    return list.slice(start, start + this.vehiclePageSize());
  });

  // Events for other tabs
  onAddProductCode(): void {
    this.addProductCode.emit();
  }
  onToggleProductCodeStatus(id: string): void {
    this.toggleProductCodeStatus.emit(id);
  }
  onRemoveProductCode(id: string): void {
    this.removeProductCode.emit(id);
  }

  onAddEquivalent(): void {
    this.addEquivalent.emit();
  }
  onToggleEquivalentStatus(id: string): void {
    this.toggleEquivalentStatus.emit(id);
  }
  onRemoveEquivalent(id: string): void {
    this.removeEquivalent.emit(id);
  }

  onAddVehicleApplication(): void {
    this.openVehicleLinkDrawer();
  }

  onToggleVehicleStatus(id: string): void {
    // if (this.isReadOnly()) return;
    // const current = this.vehicleApplications();
    // const updated = current.map((v) =>
    //   v.id === id
    //     ? { ...v, status: (v.status === 'Ativo' ? 'Inativo' : 'Ativo') as 'Ativo' | 'Inativo' }
    //     : v,
    // );
    // this.vehicleApplicationsChange.emit(updated);
    // this.vehicleApplicationIdsChange.emit(updated.map((u) => u.id));
    // this.toggleVehicleStatus.emit(id);
  }

  onRemoveVehicleApplication(id: string): void {
    if (this.isReadOnly()) return;
    const current = this.vehicleApplications();
    const updated = current.filter((v) => v.id !== id);
    this.vehicleApplicationsChange.emit(updated);
    this.vehicleApplicationIdsChange.emit(updated.map((u) => u.id));
    this.removeVehicleApplication.emit(id);
  }

  // --- Quick Vehicle Application Drawers & Link Logic ---
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
    // this.loadingVehicleApplications.set(true);
    // this.vehicleAppService.getAll().subscribe({
    //   next: (res) => {
    //     this.availableVehicleApplications.set(res.data || []);
    //     this.loadingVehicleApplications.set(false);
    //   },
    //   error: () => {
    //     this.loadingVehicleApplications.set(false);
    //   },
    // });
  }

  readonly filteredAvailableVehicleApps = computed(() => {
    // let list = this.availableVehicleApplications();
    // const query = this.vehicleSearchQuery().toLowerCase().trim();
    // const brand = this.selectedVehicleBrandFilter();

    // if (query) {
    //   list = list.filter((a) => {
    //     const full = (
    //       a.display_name ||
    //       `${a.brand?.name || ''} ${a.model?.name || ''} ${a.version?.name || ''} ${a.engine?.name || ''} ${a.notes || ''}`
    //     ).toLowerCase();
    //     return full.includes(query);
    //   });
    // }

    // if (brand && brand !== 'all') {
    //   list = list.filter((a) => a.vehicle_brand_id === brand || a.brand?.id === brand);
    // }

    // return list;
    return [];
  });

  readonly paginatedAvailableVehicleApps = computed(() => {
    const list = this.filteredAvailableVehicleApps();
    const start = (this.linkDrawerPage() - 1) * this.linkDrawerPageSize();
    return list.slice(start, start + this.linkDrawerPageSize());
  });

  isVehicleAppLinked(appId: string): boolean {
    return this.vehicleApplications().some((v) => v.id === appId);
  }

  toggleVehicleLink(app: VehicleApplicationResponse): void {
    // if (this.isReadOnly()) return;
    // const current = [...this.vehicleApplications()];
    // const exists = current.some((v) => v.id === app.id);
    // let updated: VehicleApplicationItem[];
    // if (exists) {
    //   updated = current.filter((v) => v.id !== app.id);
    // } else {
    //   const brandName = app.brand?.name || 'Montadora';
    //   const modelName = app.model?.name || 'Modelo';
    //   const versionName = app.version?.name || 'Versão';
    //   const engineName = app.engine
    //     ? `${app.engine.name}${app.engine.displacement ? ` (${app.engine.displacement})` : ''}`
    //     : 'Todas as motorizações';
    //   const newItem: VehicleApplicationItem = {
    //     id: app.id,
    //     brand: brandName,
    //     model: modelName,
    //     version: versionName,
    //     engine: engineName,
    //     startYear: app.year_from || 1900,
    //     endYear: app.year_to || new Date().getFullYear(),
    //     notes: app.notes || '',
    //     status: app.active ? 'Ativo' : 'Inativo',
    //   };
    //   updated = [newItem, ...current];
    // }
    // this.vehicleApplicationsChange.emit(updated);
    // this.vehicleApplicationIdsChange.emit(updated.map((u) => u.id));
  }

  onNewVehicleSaved(newApp: VehicleApplicationResponse): void {
    // this.availableVehicleApplications.update((list) => [newApp, ...list]);
    // const current = [...this.vehicleApplications()];
    // if (!current.some((v) => v.id === newApp.id)) {
    //   const brandName = newApp.brand?.name || 'Montadora';
    //   const modelName = newApp.model?.name || 'Modelo';
    //   const versionName = newApp.version?.name || 'Versão';
    //   const engineName = newApp.engine
    //     ? `${newApp.engine.name}${newApp.engine.displacement ? ` (${newApp.engine.displacement})` : ''}`
    //     : 'Todas as motorizações';
    //   const newItem: VehicleApplicationItem = {
    //     id: newApp.id,
    //     brand: brandName,
    //     model: modelName,
    //     version: versionName,
    //     engine: engineName,
    //     startYear: newApp.year_from || 1900,
    //     endYear: newApp.year_to || new Date().getFullYear(),
    //     notes: newApp.notes || '',
    //     status: newApp.active ? 'Ativo' : 'Inativo',
    //   };
    //   const updated = [newItem, ...current];
    //   this.vehicleApplicationsChange.emit(updated);
    //   this.vehicleApplicationIdsChange.emit(updated.map((u) => u.id));
    // }
    // this.closeNewVehicleDrawer();
  }
}
