import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { FormTab } from '../../../models/product-workspace.model';

@Component({
  selector: 'app-product-workspace-sidebar',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-workspace-sidebar.html',
})
export class ProductWorkspaceSidebarComponent implements AfterViewInit {
  @ViewChild('navContainer') navContainer?: ElementRef<HTMLDivElement>;

  readonly productName = input<string>('');
  readonly internalCode = input<string>('');
  readonly status = input<{ name?: string; color?: string; code?: string } | null>(null);
  readonly activeTab = input.required<FormTab>();

  // Item counts for enrichment badges
  readonly mediaImagesCount = input<number>(0);
  readonly oemCodesCount = input<number>(0);
  readonly productCodesCount = input<number>(0);
  readonly vehicleApplicationsCount = input<number>(0);
  readonly equivalentProductsCount = input<number>(0);
  readonly suppliersCount = input<number>(0);
  readonly tagsCount = input<number>(0);
  readonly notesCount = input<number>(0);

  readonly errors = input<Record<string, string>>({});

  readonly tabChange = output<FormTab>();

  readonly canScrollLeft = signal<boolean>(false);
  readonly canScrollRight = signal<boolean>(true);

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScrollState(), 50);
  }

  checkScrollState(): void {
    const el = this.navContainer?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 4);
    this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  scrollTabs(direction: 'left' | 'right'): void {
    const el = this.navContainer?.nativeElement;
    if (!el) return;
    const distance = Math.min(el.clientWidth * 0.7, 280);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
    setTimeout(() => this.checkScrollState(), 300);
  }

  setActiveTab(tab: FormTab, event?: MouseEvent): void {
    console.log('[setActiveTab]', tab);
    this.tabChange.emit(tab);

    if (event?.currentTarget) {
      (event.currentTarget as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(() => this.checkScrollState(), 350);
    }
  }

  onSelectTab(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.setActiveTab(target.value as FormTab);
    }
  }

  hasTabError(tab: FormTab): boolean {
    const errs = this.errors();
    if (!errs) return false;
    if (tab === 'geral') {
      return !!(errs['name'] || errs['categoryId'] || errs['manufacturerId']);
    }
    if (tab === 'comercial') {
      return !!errs['price'];
    }
    if (tab === 'inventario') {
      return !!errs['quantity'];
    }
    return false;
  }

  tabClasses(tab: FormTab): string {
    const isActive = this.activeTab() === tab;
    const base =
      'group relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 border-b-2 focus:outline-none ';
    if (isActive) {
      return (
        base +
        'border-[#4F8A6B] text-[#4F8A6B] dark:text-[#5BAE6A] font-semibold bg-[#4F8A6B]/5 dark:bg-[#4F8A6B]/10 rounded-t-lg'
      );
    }
    return (
      base +
      'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
    );
  }

  badgeClasses(tab: FormTab): string {
    const isActive = this.activeTab() === tab;
    if (isActive) {
      return 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#4F8A6B]/15 text-[#4F8A6B] dark:bg-[#4F8A6B]/30 dark:text-[#5BAE6A]';
    }
    return 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 dark:bg-slate-700/60 dark:text-slate-400 group-hover:bg-gray-200 dark:group-hover:bg-slate-700';
  }

  mobileTabClasses(tab: FormTab): string {
    return this.tabClasses(tab);
  }
  sidebarTabClasses(tab: FormTab): string {
    return this.tabClasses(tab);
  }
}
