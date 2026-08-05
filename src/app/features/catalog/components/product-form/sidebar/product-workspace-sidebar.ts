import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import {
  COMPATIBILITY_MODULES,
  CompatibilityModuleConfig,
} from '../../../../../core/config/compatibility-modules.config';
import { FormTab } from '../../../models/product-workspace.model';

@Component({
  selector: 'app-product-workspace-sidebar',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-workspace-sidebar.html',
  styleUrl: './product-workspace-sidebar.css',
})
export class ProductWorkspaceSidebarComponent {
  readonly productName = input<string>('');
  readonly internalCode = input<string>('');
  readonly active = input<boolean>(true);
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

  readonly compatibilityModules = COMPATIBILITY_MODULES;

  readonly tabChange = output<FormTab>();

  setActiveTab(tab: FormTab): void {
    this.tabChange.emit(tab);
  }

  onSelectTab(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      this.setActiveTab(target.value as FormTab);
    }
  }

  getModuleCount(key: CompatibilityModuleConfig['countKey']): number {
    switch (key) {
      case 'oemCodesCount':
        return this.oemCodesCount();
      case 'productCodesCount':
        return this.productCodesCount();
      case 'equivalentProductsCount':
        return this.equivalentProductsCount();
      case 'vehicleApplicationsCount':
        return this.vehicleApplicationsCount();
    }
  }

  mobileTabClasses(tab: FormTab): string {
    const isActive = this.activeTab() === tab;
    const base =
      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ';
    if (isActive) {
      return base + 'bg-[#4F8A6B] text-white shadow-xs';
    }
    return base + 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60';
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

  sidebarTabClasses(tab: FormTab): string {
    const isActive = this.activeTab() === tab;
    const base =
      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ';
    if (isActive) {
      return base + 'bg-[#4F8A6B] text-white shadow-xs';
    }
    return base + 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60';
  }
}
