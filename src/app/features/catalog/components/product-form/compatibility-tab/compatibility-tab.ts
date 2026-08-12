import { Component, ChangeDetectionStrategy, computed, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../design-system/pagination/pagination';
import { getCompatibilityModuleByTab } from '../../../../../core/config/compatibility-modules.config';
import { FormTab } from '../../../models/product-workspace.model';
import { ProductOemCode } from '../../../../../core/models/oem-codes/oem-codes-product.model';
import { ProductAdditionalCodeSummary } from '../../../../../core/models/additional-codes/additional-codes-product.model';
import { ProductEquivalent } from '../../../../../core/models/equivalent/equivalent-products.model';
import { ProductVehicleApplication } from '../../../../../core/models/vehicle-application/vehicle-application-product.model';

@Component({
  selector: 'app-product-compatibility-tab',
  standalone: true,
  imports: [ButtonComponent, AppIconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compatibility-tab.html',
})
export class ProductCompatibilityTabComponent {
  readonly activeTab = input.required<FormTab>();
  readonly oemCodes = input<ProductOemCode[]>([]);
  readonly productCodes = input<ProductAdditionalCodeSummary[]>([]);
  readonly equivalentProducts = input<ProductEquivalent[]>([]);
  readonly vehicleApplications = input<ProductVehicleApplication[]>([]);
  readonly isReadOnly = input<boolean>(false);

  readonly addOemCode = output<void>();
  readonly setPrimaryOem = output<string>();
  readonly removeOemCode = output<string>();
  readonly toggleOemStatus = output<string>();

  readonly addProductCode = output<void>();
  readonly removeProductCode = output<string>();
  readonly toggleProductCodeStatus = output<string>();

  readonly addEquivalent = output<void>();
  readonly removeEquivalent = output<string>();
  readonly toggleEquivalentStatus = output<string>();

  readonly addVehicleApplication = output<void>();
  readonly removeVehicleApplication = output<string>();
  readonly toggleVehicleStatus = output<string>();

  readonly oemPage = signal(1);
  readonly oemPageSize = signal(10);
  readonly productCodesPage = signal(1);
  readonly productCodesPageSize = signal(10);
  readonly equivalentPage = signal(1);
  readonly equivalentPageSize = signal(10);
  readonly vehiclePage = signal(1);
  readonly vehiclePageSize = signal(10);

  readonly oemPaginated = computed(() =>
    this.paginate(this.oemCodes(), this.oemPage(), this.oemPageSize()),
  );
  readonly productCodesPaginated = computed(() =>
    this.paginate(this.productCodes(), this.productCodesPage(), this.productCodesPageSize()),
  );
  readonly equivalentPaginated = computed(() =>
    this.paginate(this.equivalentProducts(), this.equivalentPage(), this.equivalentPageSize()),
  );
  readonly vehiclePaginated = computed(() =>
    this.paginate(this.vehicleApplications(), this.vehiclePage(), this.vehiclePageSize()),
  );

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

  onAddProductCode(): void {
    this.addProductCode.emit();
  }
  onRemoveProductCode(id: string): void {
    this.removeProductCode.emit(id);
  }
  onToggleProductCodeStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleProductCodeStatus.emit(id);
  }

  onAddEquivalent(): void {
    this.addEquivalent.emit();
  }
  onRemoveEquivalent(id: string): void {
    this.removeEquivalent.emit(id);
  }
  onToggleEquivalentStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleEquivalentStatus.emit(id);
  }

  onAddVehicleApplication(): void {
    this.addVehicleApplication.emit();
  }
  onRemoveVehicleApplication(id: string): void {
    this.removeVehicleApplication.emit(id);
  }
  onToggleVehicleStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleVehicleStatus.emit(id);
  }

  private paginate<T>(items: T[], page: number, pageSize: number): T[] {
    return items.slice((page - 1) * pageSize, page * pageSize);
  }
}
