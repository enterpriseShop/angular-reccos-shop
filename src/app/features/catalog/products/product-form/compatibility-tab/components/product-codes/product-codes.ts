import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { ButtonComponent } from '../../../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../../../design-system/pagination/pagination';
import { ProductAdditionalCodeSummary } from '../../../../../../../core/models/additional-codes/additional-codes-product.model';

@Component({
  selector: 'app-product-codes',
  standalone: true,
  imports: [ButtonComponent, AppIconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-codes.html',
})
export class ProductCodesComponent {
  // Inputs
  readonly productCodes = input<ProductAdditionalCodeSummary[]>([]);
  readonly isReadOnly = input<boolean>(false);

  // Outputs
  readonly addProductCode = output<void>();
  readonly removeProductCode = output<string>();
  readonly toggleProductCodeStatus = output<string>();

  // Pagination
  readonly productCodesPage = signal<number>(1);
  readonly productCodesPageSize = signal<number>(5);

  readonly productCodesPaginated = computed(() => {
    const list = this.productCodes();
    const start = (this.productCodesPage() - 1) * this.productCodesPageSize();
    return list.slice(start, start + this.productCodesPageSize());
  });

  onAddProductCode(): void {
    if (this.isReadOnly()) return;
    this.addProductCode.emit();
  }

  onToggleProductCodeStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleProductCodeStatus.emit(id);
  }

  onRemoveProductCode(id: string): void {
    if (this.isReadOnly()) return;
    this.removeProductCode.emit(id);
  }
}
