import { Injectable, signal, computed } from '@angular/core';
import { MenuItem, NotificationItem, ShortcutItem } from '../models/menu-item';

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ShellStateService {
  // Sidebar state
  readonly sidebarExpanded = signal<boolean>(true);
  readonly mobileDrawerOpen = signal<boolean>(false);
  readonly openGroup = signal<string | null>('catalog'); // ID of currently open group

  // Notification Drawer state
  readonly notificationsDrawerOpen = signal<boolean>(false);

  // Global search state
  readonly globalSearchQuery = signal<string>('');
  readonly isSearching = signal<boolean>(false);

  // Active route tracking
  readonly activeRoute = signal<string>('/catalog/products');

  // User details mock
  readonly currentUser = signal({
    name: 'Carlos Eduardo',
    role: 'Administrador de Catálogo',
    email: 'carlos.eduardo@reccos.com.br',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    unit: 'Matriz - São Paulo'
  });

  // Navigation Items according to Reccos Shop Specification
  readonly menuItems = signal<MenuItem[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/dashboard'
    },
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: 'box',
      children: [
        { id: 'categories', label: 'Categorias', route: '/catalog/categories' },
        { id: 'manufacturers', label: 'Fabricantes', route: '/catalog/manufacturers' },
        { id: 'products', label: 'Produtos', route: '/catalog/products', badge: '12.4k' },
        { id: 'tags', label: 'Tags', route: '/catalog/tags' },
        { id: 'origins', label: 'Origem da Peça', route: '/catalog/origins' },
        { id: 'units', label: 'Unidades', route: '/catalog/units' }
      ]
    },
    {
      id: 'compatibility',
      label: 'Compatibilidade',
      icon: 'layers',
      children: [
        { id: 'oem', label: 'OEM Codes', route: '/compatibility/oem-codes' },
        { id: 'product-codes', label: 'Product Codes', route: '/compatibility/product-codes' },
        { id: 'equivalents', label: 'Produtos Equivalentes', route: '/compatibility/equivalent-products' },
        { id: 'applications', label: 'Aplicações', route: '/compatibility/applications' }
      ]
    },
    {
      id: 'vehicles',
      label: 'Veículos',
      icon: 'car',
      children: [
        { id: 'brands', label: 'Montadoras', route: '/vehicles/brands' },
        { id: 'models', label: 'Modelos', route: '/vehicles/models' },
        { id: 'versions', label: 'Versões', route: '/vehicles/versions' },
        { id: 'engines', label: 'Motores', route: '/vehicles/engines' }
      ]
    },
    {
      id: 'commercial',
      label: 'Comercial',
      icon: 'shopping-bag',
      children: [
        { id: 'inventory', label: 'Estoque', route: '/commercial/inventory', badge: 'Atenção' },
        { id: 'pricing', label: 'Preços', route: '/commercial/pricing' },
        { id: 'warehouses', label: 'Depósitos', route: '/commercial/warehouses' },
        { id: 'suppliers', label: 'Fornecedores', route: '/commercial/suppliers' }
      ]
    },
    {
      id: 'imports',
      label: 'Importações',
      icon: 'upload-cloud',
      route: '/imports',
      badge: 'Novo'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: 'bar-chart-3',
      route: '/reports'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: 'bell',
      route: '/notifications',
      badge: '3'
    },
    {
      id: 'admin',
      label: 'Administração',
      icon: 'settings',
      route: '/admin'
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: 'help-circle',
      route: '/help'
    }
  ]);

  // Grouped Menu Items for Section Headers in Sidebar
  readonly menuGroups = computed<MenuGroup[]>(() => [
    {
      id: 'main',
      title: 'Módulos Principais',
      items: this.menuItems().slice(0, 5)
    },
    {
      id: 'operations',
      title: 'Ferramentas & Integração',
      items: this.menuItems().slice(5, 8)
    },
    {
      id: 'system',
      title: 'Administrativo',
      items: this.menuItems().slice(8)
    }
  ]);

  // Notifications mock data
  readonly notifications = signal<NotificationItem[]>([
    {
      id: '1',
      title: 'Estoque Baixo - Correia Dentada Contitech CT1028',
      description: 'Apenas 3 unidades restantes no depósito Central SP.',
      timestamp: 'Há 12 min',
      read: false,
      type: 'warning',
      link: '/commercial/inventory'
    },
    {
      id: '2',
      title: 'Importação Concluída com Sucesso',
      description: 'Arquivo tabela_precos_bosch_2026.xlsx processado: 1.420 produtos atualizados.',
      timestamp: 'Há 45 min',
      read: false,
      type: 'success',
      link: '/imports'
    },
    {
      id: '3',
      title: 'Solicitação de Nova Categoria',
      description: 'Solicitação #892 referente a Categoria Sistemas Eletrônicos de Freio.',
      timestamp: 'Há 2 horas',
      read: false,
      type: 'info',
      link: '/catalog/categories'
    },
    {
      id: '4',
      title: 'Erro no Mapeamento OEM #4092',
      description: 'Código OEM incorreto detectado na montadora Volkswagen.',
      timestamp: 'Ontem',
      read: true,
      type: 'error',
      link: '/compatibility/oem-codes'
    }
  ]);

  // Shortcuts mock
  readonly shortcuts = signal<ShortcutItem[]>([
    { id: 'new-product', label: 'Novo Produto', icon: 'plus-circle', route: '/catalog/products/new', category: 'Catálogo' },
    { id: 'new-category', label: 'Nova Categoria', icon: 'folder-plus', route: '/catalog/categories/new', category: 'Catálogo' },
    { id: 'new-manufacturer', label: 'Novo Fabricante', icon: 'building', route: '/catalog/manufacturers/new', category: 'Catálogo' },
    { id: 'inventory-adj', label: 'Ajuste de Estoque', icon: 'package-check', route: '/commercial/inventory/adjust', category: 'Comercial' },
    { id: 'import-data', label: 'Nova Importação', icon: 'upload', route: '/imports/new', category: 'Importação' }
  ]);

  // Computed unread notifications count
  readonly unreadNotificationsCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  // Toggles and setters
  toggleSidebar(): void {
    this.sidebarExpanded.update(v => !v);
  }

  toggleDesktopSidebar(): void {
    this.toggleSidebar();
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update(v => !v);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  openNotificationsDrawer(): void {
    this.notificationsDrawerOpen.set(true);
  }

  toggleNotificationsDrawer(): void {
    this.notificationsDrawerOpen.update(v => !v);
  }

  closeNotificationsDrawer(): void {
    this.notificationsDrawerOpen.set(false);
  }

  setGlobalSearch(query: string): void {
    this.globalSearchQuery.set(query);
  }

  markAllNotificationsAsRead(): void {
    this.notifications.update(items => items.map(i => ({ ...i, read: true })));
  }

  markNotificationAsRead(id: string): void {
    this.notifications.update(items =>
      items.map(i => (i.id === id ? { ...i, read: true } : i))
    );
  }

  toggleGroup(groupId: string): void {
    if (this.openGroup() === groupId) {
      this.openGroup.set(null);
    } else {
      this.openGroup.set(groupId);
    }
  }

  setActiveRoute(route: string): void {
    this.activeRoute.set(route);
    // Automatically expand parent group if route belongs to a child
    const parent = this.menuItems().find(item =>
      item.children?.some(child => child.route === route)
    );
    if (parent) {
      this.openGroup.set(parent.id);
    }
  }
}
