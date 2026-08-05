import { FormTab } from '../../features/catalog/models/product-workspace.model';
import { SubMenuItem } from '../models/menu-item';

export interface CompatibilityModuleConfig {
  menuId: string;
  workspaceTab: FormTab;
  label: string;
  route: string;
  icon: string;
  headerIcon: string;
  headerIconClass: string;
  description: string;
  countKey:
    | 'oemCodesCount'
    | 'productCodesCount'
    | 'equivalentProductsCount'
    | 'vehicleApplicationsCount';
}

/** Módulos de compatibilidade — fonte única alinhada ao menu do shell-state */
export const COMPATIBILITY_MODULES: CompatibilityModuleConfig[] = [
  {
    menuId: 'oem',
    workspaceTab: 'oem',
    label: 'OEM Codes',
    route: '/compatibility/oem-codes',
    icon: 'hash',
    headerIcon: 'box',
    headerIconClass: 'text-[#4F8A6B]',
    description: 'Códigos originais de montadoras de referência cadastrados para esta peça',
    countKey: 'oemCodesCount',
  },
  {
    menuId: 'product-codes',
    workspaceTab: 'codigos',
    label: 'Product Codes',
    route: '/compatibility/product-codes',
    icon: 'barcode',
    headerIcon: 'tag',
    headerIconClass: 'text-[#5A8DEE]',
    description: 'EAN, DUN, Código do fabricante, Código paralelo e Código interno auxiliar',
    countKey: 'productCodesCount',
  },
  {
    menuId: 'equivalents',
    workspaceTab: 'equivalentes',
    label: 'Produtos Equivalentes',
    route: '/compatibility/equivalent-products',
    icon: 'copy',
    headerIcon: 'copy',
    headerIconClass: 'text-purple-500',
    description: 'Relacionamento entre produtos equivalentes e marcas cruzadas',
    countKey: 'equivalentProductsCount',
  },
  {
    menuId: 'applications',
    workspaceTab: 'compatibilidade',
    label: 'Aplicações',
    route: '/compatibility/applications',
    icon: 'layers',
    headerIcon: 'car',
    headerIconClass: 'text-amber-500',
    description: 'Relacionamento entre o produto e suas aplicações veiculares',
    countKey: 'vehicleApplicationsCount',
  },
];

export function compatibilityMenuChildren(): SubMenuItem[] {
  return COMPATIBILITY_MODULES.map(({ menuId, label, route }) => ({
    id: menuId,
    label,
    route,
  }));
}

export const COMPATIBILITY_WORKSPACE_TABS: FormTab[] = COMPATIBILITY_MODULES.map(
  (module) => module.workspaceTab,
);

export function isCompatibilityWorkspaceTab(tab: FormTab): boolean {
  return COMPATIBILITY_WORKSPACE_TABS.includes(tab);
}

export function getCompatibilityModuleByTab(tab: FormTab): CompatibilityModuleConfig | undefined {
  return COMPATIBILITY_MODULES.find((module) => module.workspaceTab === tab);
}
