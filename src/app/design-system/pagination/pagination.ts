import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { PaginationMeta } from '../../core/models/pagination/pagination.model';
import { initialValuesPagination } from './utils/initial-values';

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
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showPageSize = input<boolean>(true);
  readonly showItemRange = input<boolean>(true);
  readonly pagination = input<PaginationMeta>(initialValuesPagination);
  readonly optionsSizes = signal<number[]>([5, 10, 25, 50, 100]);

  // Evento Unificado para o Pai
  readonly paginationChange = output<PaginationMeta>();

  //remover depois
  readonly currentPage = input<number>();
  readonly totalItems = input<number>();

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    return this.pagination().last_page;
  });

  readonly pageSize = computed(() => {
    return this.pagination().per_page;
  });

  readonly startItem = computed(() => {
    return this.pagination().from;
  });

  readonly endItem = computed(() => {
    return this.pagination().to;
  });

  readonly startItemFormatted = computed(() => {
    return this.startItem()?.toLocaleString('pt-BR');
  });

  readonly endItemFormatted = computed(() => {
    return this.endItem()?.toLocaleString('pt-BR');
  });

  readonly totalItemsFormatted = computed(() => {
    return this.pagination().total.toLocaleString('pt-BR');
  });

  readonly visiblePages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.pagination().current_page;

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
    const currentMeta = this.pagination();

    // Evita ir para páginas inválidas ou para a página atual
    if (page < 1 || page > this.totalPages() || page === currentMeta.current_page) return;

    // Emite o evento individual simples
    this.pageChange.emit(page);

    // Emite o objeto PaginationMeta atualizado mantendo per_page
    this.paginationChange.emit({
      ...currentMeta,
      current_page: page,
    });
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    const currentMeta = this.pagination();

    if (!isNaN(size) && size !== currentMeta.per_page) {
      this.pageSizeChange.emit(size);

      if (currentMeta.current_page !== 1) {
        this.pageChange.emit(1);
      }

      this.paginationChange.emit({
        ...currentMeta,
        current_page: 1,
        per_page: size,
      });
    }
  }

  onDirectJump(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const val = parseInt(inputEl.value, 10);
    if (!isNaN(val) && val >= 1 && val <= this.totalPages()) {
      this.goToPage(val);
    } else {
      inputEl.value = this.pagination().current_page.toString();
    }
  }
}
