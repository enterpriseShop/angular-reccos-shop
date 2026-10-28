import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonComponent } from '../../../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../../../design-system/pagination/pagination';
import { OemCodeFormComponent } from '../../../../../oem-code/oem-code-form/oem-code-form';
import {
  OemCode,
  ProductOemCodeResource,
} from '../../../../../../../core/models/oem-codes/oem-codes.model';
import { PaginationMeta } from '../../../../../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../../../../../design-system/pagination/utils/initial-values';
import { OemCodeFilterRequest } from '../../../../../../../core/models/oem-codes/oem-codes-filter-request.model';

@Component({
  selector: 'app-product-oem',
  standalone: true,
  imports: [DatePipe, ButtonComponent, AppIconComponent, PaginationComponent, OemCodeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-oem.html',
})
export class ProductOemComponent {
  // Inputs
  readonly oemCodes = input<OemCode[]>([]);
  readonly selectedOemCodeIds = input<string[]>([]);
  readonly registeredOemCodes = input<ProductOemCodeResource[]>([]);
  readonly isReadOnly = input<boolean>(false);

  // Outputs
  readonly selectedOemCodeIdsChange = output<string[]>();
  readonly oemCodeIdsChange = output<string[]>();

  // State
  readonly dynamicallyCreatedOemCodes = signal<ProductOemCodeResource[]>([]);
  readonly isOemDrawerOpen = signal<boolean>(false);
  readonly oemSearchQuery = signal<string>('');
  readonly selectedMfrFilter = signal<string>('all');

  // Pagination
  readonly page = signal<number>(1);
  readonly perPage = signal<number>(10);
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);
  params: OemCodeFilterRequest = {
    search: null,
    page: this.page(),
    per_page: this.perPage(),
    manufacturer_id: null,
  };

  // Consolidated registered OEM codes list
  readonly availableOemCodes = computed<ProductOemCodeResource[]>(() => {
    const dynamic = this.dynamicallyCreatedOemCodes();
    let baseList: ProductOemCodeResource[] = [];

    const reg = this.registeredOemCodes();
    if (reg && reg.length > 0) {
      baseList = reg;
    }

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
    return [];
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
    const start = (this.page() - 1) * this.perPage();
    return list.slice(start, start + this.perPage());
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

  isOemSelected(id: string): boolean {
    return this.currentSelectedOemIds().includes(id);
  }

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

  selectAllVisibleOem(): void {
    if (this.isReadOnly()) return;
    const currentSet = new Set(this.currentSelectedOemIds());
    this.filteredOemCodes().forEach((item) => currentSet.add(item.id));
    const updated = Array.from(currentSet);

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  deselectAllOem(): void {
    if (this.isReadOnly()) return;
    const visibleIds = new Set(this.filteredOemCodes().map((i) => i.id));
    const updated = this.currentSelectedOemIds().filter((id) => !visibleIds.has(id));

    this.selectedOemCodeIdsChange.emit(updated);
    this.oemCodeIdsChange.emit(updated);
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    // this.getPaginationAllCategories(this.params);
  }

  onOemSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.oemSearchQuery.set(val);
    this.page.set(1);
  }

  clearOemSearch(): void {
    this.oemSearchQuery.set('');
    this.page.set(1);
  }

  setMfrFilter(mfr: string): void {
    this.selectedMfrFilter.set(mfr);
    this.page.set(1);
  }
}
