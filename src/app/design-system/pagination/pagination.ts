import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

export interface PageItem {
  type: 'page' | 'ellipsis';
  page?: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  readonly currentPage = input<number>(1);
  readonly pageSize = input<number>(10);
  readonly totalItems = input<number>(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showPageSize = input<boolean>(true);
  readonly showItemRange = input<boolean>(true);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  });

  readonly startItem = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endItem = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  readonly startItemFormatted = computed(() => {
    return this.startItem().toLocaleString('pt-BR');
  });

  readonly endItemFormatted = computed(() => {
    return this.endItem().toLocaleString('pt-BR');
  });

  readonly totalItemsFormatted = computed(() => {
    return this.totalItems().toLocaleString('pt-BR');
  });

  readonly visiblePages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      const items: PageItem[] = [];
      for (let i = 1; i <= total; i++) {
        items.push({ type: 'page', page: i });
      }
      return items;
    }

    const pages: PageItem[] = [];

    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push({ type: 'page', page: i });
      }
      pages.push({ type: 'ellipsis' });
      pages.push({ type: 'page', page: total });
    } else if (current >= total - 3) {
      pages.push({ type: 'page', page: 1 });
      pages.push({ type: 'ellipsis' });
      for (let i = total - 4; i <= total; i++) {
        pages.push({ type: 'page', page: i });
      }
    } else {
      pages.push({ type: 'page', page: 1 });
      pages.push({ type: 'ellipsis' });
      pages.push({ type: 'page', page: current - 1 });
      pages.push({ type: 'page', page: current });
      pages.push({ type: 'page', page: current + 1 });
      pages.push({ type: 'ellipsis' });
      pages.push({ type: 'page', page: total });
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(size)) {
      this.pageSizeChange.emit(size);
    }
  }

  onDirectJump(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const val = parseInt(inputEl.value, 10);
    if (!isNaN(val) && val >= 1 && val <= this.totalPages()) {
      this.goToPage(val);
    } else {
      inputEl.value = this.currentPage().toString();
    }
  }
}
