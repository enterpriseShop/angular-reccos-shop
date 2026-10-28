import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { ButtonComponent } from '../../../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../../../design-system/pagination/pagination';
import { ProductEquivalent } from '../../../../../../../core/models/equivalent/equivalent-products.model';

@Component({
  selector: 'app-product-equivalents',
  standalone: true,
  imports: [ButtonComponent, AppIconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-equivalents.html',
})
export class ProductEquivalentsComponent {
  // Inputs
  readonly equivalentProducts = input<ProductEquivalent[]>([]);
  readonly isReadOnly = input<boolean>(false);

  // Outputs
  readonly addEquivalent = output<void>();
  readonly removeEquivalent = output<string>();
  readonly toggleEquivalentStatus = output<string>();

  // Pagination
  readonly equivalentPage = signal<number>(1);
  readonly equivalentPageSize = signal<number>(5);

  readonly equivalentPaginated = computed(() => {
    const list = this.equivalentProducts();
    const start = (this.equivalentPage() - 1) * this.equivalentPageSize();
    return list.slice(start, start + this.equivalentPageSize());
  });

  onAddEquivalent(): void {
    if (this.isReadOnly()) return;
    this.addEquivalent.emit();
  }

  onToggleEquivalentStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleEquivalentStatus.emit(id);
  }

  onRemoveEquivalent(id: string): void {
    if (this.isReadOnly()) return;
    this.removeEquivalent.emit(id);
  }
}
