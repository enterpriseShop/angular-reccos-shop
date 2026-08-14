import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  output,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../design-system/pagination/pagination';
import { getCompatibilityModuleByTab } from '../../../../../core/config/compatibility-modules.config';
import { FormTab } from '../../../models/product-workspace.model';
import { ProductAdditionalCodeSummary } from '../../../../../core/models/additional-codes/additional-codes-product.model';
import { ProductEquivalent } from '../../../../../core/models/equivalent/equivalent-products.model';
import { ProductVehicleApplication } from '../../../../../core/models/vehicle-application/vehicle-application-product.model';
import { OemCode } from '../../../../../core/models/oem-codes/oem-codes.model';
import { DatePipe } from '@angular/common';
import { ManufacturerOption } from '../../../../../core/models/manufactureres/manufaturer-options.model';

@Component({
  selector: 'app-product-compatibility-tab',
  standalone: true,
  imports: [ButtonComponent, AppIconComponent, PaginationComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compatibility-tab.html',
})
export class ProductCompatibilityTabComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    console.log('[CHANGES ON COMPATIBILITY TAB]: ', changes);
  }
  readonly activeTab = input.required<FormTab>();
  readonly oemCodes = input<OemCode[]>([]);
  readonly manufacturerByProductFilter = input<ManufacturerOption[]>([]);
  readonly selectedOemCodeIds = input<string[]>([]);
  readonly productCodes = input<ProductAdditionalCodeSummary[]>([]);
  readonly equivalentProducts = input<ProductEquivalent[]>([]);
  readonly vehicleApplications = input<ProductVehicleApplication[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly totalItensOemCodes = input<number>(0);

  // Outputs for OEM selection
  readonly selectedOemCodeIdsChange = output<string[]>();
  readonly oemCodeIdsChange = output<string[]>();

  // Outputs for other tabs
  readonly addProductCode = output<void>();
  readonly removeProductCode = output<string>();
  readonly toggleProductCodeStatus = output<string>();

  readonly addEquivalent = output<void>();
  readonly toggleEquivalentStatus = output<string>();
  readonly removeEquivalent = output<string>();

  readonly addVehicleApplication = output<void>();
  readonly toggleVehicleStatus = output<string>();
  readonly removeVehicleApplication = output<string>();

  // OEM Search & Filter Signals
  readonly oemSearchQuery = signal<string>('');
  readonly selectedMfrFilter = signal<string | null>(null);
  readonly oemPagination = signal({
    page: 1,
    per_page: 10,
  });

  private emitOemFilters(): void {
    this.oemFiltersChange.emit({
      search: this.oemSearchQuery(),
      manufacturer_id: this.selectedMfrFilter(),
      page: this.oemPagination().page,
      per_page: this.oemPagination().per_page,
    });
  }

  // OEM Outputs pagination
  readonly oemFiltersChange = output<{
    search: string;
    manufacturer_id: string | null;
    page: number;
    per_page: number;
  }>();

  readonly addOemCode = output<void>();
  readonly setPrimaryOem = output<string>();
  readonly removeOemCode = output<string>();
  readonly toggleOemStatus = output<string>();

  readonly oemTotalItens = computed(() => this.totalItensOemCodes());

  // Helper: check if an OEM code ID is selected
  isOemSelected(id: string): boolean {
    return this.selectedOemCodeIds().includes(id);
  }

  // Toggle selection for a single OEM code
  toggleOemSelection(id: string): void {
    if (this.isReadOnly()) return;
    const current = [...this.selectedOemCodeIds()];
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
    const currentSet = new Set(this.selectedOemCodeIds());
    this.oemCodes().forEach((item) => currentSet.add(item.id));
    const updated = Array.from(currentSet);

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  // Deselect all currently visible OEM codes
  deselectAllOem(): void {
    if (this.isReadOnly()) return;
    const visibleIds = new Set(this.oemCodes().map((i) => i.id));
    const updated = this.selectedOemCodeIds().filter((id) => !visibleIds.has(id));

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  onOemSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.oemSearchQuery.set(value);

    this.oemPagination.update((pagination) => ({
      ...pagination,
      page: 1,
    }));

    this.emitOemFilters();
  }

  clearOemSearch(): void {
    this.oemSearchQuery.set('');

    this.oemPagination.update((pagination) => ({
      ...pagination,
      page: 1,
    }));

    this.emitOemFilters();
  }

  setMfrFilter(manufacturerId: string | null): void {
    this.selectedMfrFilter.set(manufacturerId);

    this.oemPagination.update((pagination) => ({
      ...pagination,
      page: 1,
    }));

    this.emitOemFilters();
  }

  onOemPageChange(page: number): void {
    this.oemPagination.update((pagination) => ({
      ...pagination,
      page,
    }));

    this.emitOemFilters();
  }

  onOemPageSizeChange(perPage: number): void {
    this.oemPagination.update((pagination) => ({
      ...pagination,
      page: 1,
      per_page: perPage,
    }));

    this.emitOemFilters();
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
    this.addVehicleApplication.emit();
  }

  onToggleVehicleStatus(id: string): void {
    this.toggleVehicleStatus.emit(id);
  }

  onRemoveVehicleApplication(id: string): void {
    this.removeVehicleApplication.emit(id);
  }

  getModule(tab: FormTab) {
    return getCompatibilityModuleByTab(tab)!;
  }

  onAddOemCode(): void {
    this.addOemCode.emit();
  }

  onSetPrimaryOem(id: string): void {
    this.setPrimaryOem.emit(id);
  }

  onRemoveOemCode(id: string): void {
    this.removeOemCode.emit(id);
  }

  onToggleOemStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleOemStatus.emit(id);
  }
}
