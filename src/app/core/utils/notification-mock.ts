import { Injectable, signal, computed } from '@angular/core';
import {
  AppNotification,
  NotificationReadFilter,
  NotificationCategory,
  NotificationStats,
} from '../models/notification-mock.model';

const STORAGE_KEY = 'reccos_shop_notifications_v1';

@Injectable({
  providedIn: 'root',
})
export class NotificationMockService {
  private readonly defaultNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'Estoque Crítico - Correia Dentada Contitech CT1028',
      description:
        'Apenas 3 unidades disponíveis no depósito Central SP. Ponto de reposição (10 un) atingido.',
      fullMessage:
        'Atenção: O saldo físico do produto "Correia Dentada Contitech CT1028" atingiu o limite crítico de segurança no depósito Central São Paulo. Restam apenas 3 unidades em estoque. Recomendado emitir ordem de compra junto ao fornecedor Contitech imediatamente.',
      timestamp: 'Há 12 min',
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      read: false,
      type: 'warning',
      category: 'estoque',
      priority: 'alta',
      link: '/commercial/inventory',
      relatedEntity: {
        module: 'Estoque',
        entityId: 'PROD-CT1028',
        route: '/commercial/inventory',
        label: 'Ver Estoque Central',
      },
    },
    {
      id: 'notif-2',
      title: 'Importação de Tabela de Preços Bosch 2026 Concluída',
      description:
        'Arquivo tabela_precos_bosch_2026.xlsx processado com sucesso. 1.420 produtos atualizados.',
      fullMessage:
        'A rotina de processamento em lote finalizou a leitura da planilha Bosch. Foram processados 1.420 registros de SKUs, 310 cruzamentos de códigos de equivalência e 45 novas regras de margem comercial atreladas à tabela oficial.',
      timestamp: 'Há 45 min',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false,
      type: 'success',
      category: 'importacao',
      priority: 'media',
      link: '/imports',
      relatedEntity: {
        module: 'Importações',
        entityId: 'IMP-2026-8902',
        route: '/imports',
        label: 'Ver Histórico de Importações',
      },
    },
    {
      id: 'notif-3',
      title: 'Solicitação de Nova Categoria #892',
      description: 'Solicitação referente a Categoria "Sistemas Eletrônicos de Freio (ABS/ESP)".',
      fullMessage:
        'A equipe comercial de Vendas Corporativas solicitou a criação da subcategoria "Sistemas Eletrônicos de Freio (ABS/ESP)" sob o grupo principal Freios & Suspensão. A solicitação requer aprovação do Gestor de Catálogo.',
      timestamp: 'Há 2 horas',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      type: 'info',
      category: 'catalogo',
      priority: 'baixa',
      link: '/catalog/categories',
      relatedEntity: {
        module: 'Catálogo',
        entityId: 'CAT-REQ-892',
        route: '/catalog/categories',
        label: 'Gerenciar Categorias',
      },
    },
    {
      id: 'notif-4',
      title: 'Divergência Detectada no Mapeamento OEM #4092',
      description:
        'Código OEM 030115561AN associado a Filtro de Óleo Mann HU719/7x apresentou inconformidade de veículo.',
      fullMessage:
        'O robô de validação de compatibilidade OEM identificou uma discrepância entre o código OEM VW 030115561AN e as aplicações atribuídas no motor EA111 1.6 Flex. É necessário revisar a lista de motores compatíveis no módulo de Cruzamento OEM.',
      timestamp: 'Ontem às 18:40',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'error',
      category: 'compatibilidade',
      priority: 'alta',
      link: '/compatibility/oem-codes',
      relatedEntity: {
        module: 'Compatibilidade OEM',
        entityId: 'OEM-4092-VW',
        route: '/compatibility/oem-codes',
        label: 'Corrigir Mapeamento OEM',
      },
    },
    {
      id: 'notif-5',
      title: 'Atualização da Tabela de Aplicações FIPE 2026',
      description:
        '14 novas versões de veículos elétricos e híbridos das montadoras BYD e GWM adicionadas.',
      fullMessage:
        'O banco de dados de veículos foi sincronizado com a base FIPE/Anfavea. Foram inseridas 14 novas versões de veículos, incluindo BYD Dolphin Mini, King, Song Plus e GWM Haval H6, permitindo inclusão imediata de aplicações de autopeças.',
      timestamp: '03/11/2026',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'info',
      category: 'veiculos',
      priority: 'media',
      link: '/vehicles/brands',
      relatedEntity: {
        module: 'Veículos',
        entityId: 'FIPE-2026-V11',
        route: '/vehicles/brands',
        label: 'Ver Montadoras',
      },
    },
    {
      id: 'notif-6',
      title: 'Ajuste de Balanço de Estoque - Depósito Zona Sul',
      description:
        'Inventário físico finalizado com divergência auditada de -4 unidades no SKU GP30112 Cofap.',
      fullMessage:
        'Foi registrado um ajuste manual de estoque após recontagem física no Depósito Zona Sul. O produto Amortecedor Dianteiro Cofap GP30112 teve sua quantidade reduzida de 28 para 24 unidades com motivo "Avaria em transporte interno".',
      timestamp: '02/11/2026',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'warning',
      category: 'estoque',
      priority: 'media',
      link: '/commercial/inventory',
      relatedEntity: {
        module: 'Estoque',
        entityId: 'INV-ZS-GP30112',
        route: '/commercial/inventory',
        label: 'Ver Depósito Zona Sul',
      },
    },
    {
      id: 'notif-7',
      title: 'Backup Automático de Segurança Concluído',
      description:
        'Backup integral de catálogos, equivalências e especificações técnicas gerado com sucesso.',
      fullMessage:
        'O rotina automatizada de backup de madrugada concluiu a cópia completa de segurança. Tamanho final da imagem: 1.28 GB. Arquivo assinado e sincronizado com o servidor seguro da nuvem.',
      timestamp: '01/11/2026',
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'system',
      category: 'sistema',
      priority: 'baixa',
      link: '/admin',
      relatedEntity: {
        module: 'Sistema',
        entityId: 'SYS-BKP-9821',
        route: '/admin',
        label: 'Logs do Sistema',
      },
    },
  ];

  // Signal storing all notifications
  readonly notifications = signal<AppNotification[]>(this.loadNotifications());

  // Search & Filter state
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<NotificationReadFilter>('all');
  readonly categoryFilter = signal<NotificationCategory | 'all'>('all');

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);

  // Selected notifications for bulk actions
  readonly selectedIds = signal<string[]>([]);

  // Computed: Unread Count
  readonly unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  // Computed: Top 5 Recent Notifications (for Header Bell)
  readonly recentNotifications = computed(() => {
    return [...this.notifications()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  // Computed: Overall Statistics
  readonly stats = computed<NotificationStats>(() => {
    const items = this.notifications();
    return {
      total: items.length,
      unread: items.filter((n) => !n.read).length,
      read: items.filter((n) => n.read).length,
      highPriority: items.filter((n) => n.priority === 'alta').length,
    };
  });

  // Computed: Filtered Notifications List
  readonly filteredNotifications = computed(() => {
    let result = [...this.notifications()];
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const category = this.categoryFilter();

    // Filter by read status
    if (status === 'unread') {
      result = result.filter((n) => !n.read);
    } else if (status === 'read') {
      result = result.filter((n) => n.read);
    }

    // Filter by category
    if (category !== 'all') {
      result = result.filter((n) => n.category === category);
    }

    // Filter by search text
    if (query) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          (n.fullMessage && n.fullMessage.toLowerCase().includes(query)) ||
          (n.relatedEntity?.module && n.relatedEntity.module.toLowerCase().includes(query)) ||
          (n.relatedEntity?.entityId && n.relatedEntity.entityId.toLowerCase().includes(query)),
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Computed: Paginated Result
  readonly paginatedNotifications = computed(() => {
    const list = this.filteredNotifications();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    return list.slice(startIndex, startIndex + perPage);
  });

  // Computed: Total Pages
  readonly totalPages = computed(() => {
    const totalItems = this.filteredNotifications().length;
    const perPage = this.itemsPerPage();
    return Math.max(1, Math.ceil(totalItems / perPage));
  });

  // Signal: Selected Notification for Details View
  readonly activeNotification = signal<AppNotification | null>(null);

  constructor() {
    // Keep local storage synced on change
  }

  private loadNotifications(): AppNotification[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fall back to default mock list on error
    }
    return this.defaultNotifications;
  }

  private persist(items: AppNotification[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Ignore storage errors
    }
  }

  // --- ACTIONS ---

  markAsRead(id: string): void {
    this.notifications.update((items) => {
      const updated = items.map((item) => (item.id === id ? { ...item, read: true } : item));
      this.persist(updated);
      return updated;
    });

    if (this.activeNotification()?.id === id) {
      this.activeNotification.update((n) => (n ? { ...n, read: true } : null));
    }
  }

  markAsUnread(id: string): void {
    this.notifications.update((items) => {
      const updated = items.map((item) => (item.id === id ? { ...item, read: false } : item));
      this.persist(updated);
      return updated;
    });

    if (this.activeNotification()?.id === id) {
      this.activeNotification.update((n) => (n ? { ...n, read: false } : null));
    }
  }

  toggleReadStatus(id: string): void {
    const target = this.notifications().find((n) => n.id === id);
    if (!target) return;
    if (target.read) {
      this.markAsUnread(id);
    } else {
      this.markAsRead(id);
    }
  }

  markAllAsRead(): void {
    this.notifications.update((items) => {
      const updated = items.map((item) => ({ ...item, read: true }));
      this.persist(updated);
      return updated;
    });

    if (this.activeNotification()) {
      this.activeNotification.update((n) => (n ? { ...n, read: true } : null));
    }
  }

  deleteNotification(id: string): void {
    this.notifications.update((items) => {
      const updated = items.filter((item) => item.id !== id);
      this.persist(updated);
      return updated;
    });

    // Remove from selection if selected
    this.selectedIds.update((ids) => ids.filter((i) => i !== id));

    if (this.activeNotification()?.id === id) {
      this.activeNotification.set(null);
    }
  }

  // Bulk Actions
  markSelectedAsRead(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    this.notifications.update((items) => {
      const updated = items.map((item) =>
        selected.includes(item.id) ? { ...item, read: true } : item,
      );
      this.persist(updated);
      return updated;
    });
    this.selectedIds.set([]);
  }

  markSelectedAsUnread(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    this.notifications.update((items) => {
      const updated = items.map((item) =>
        selected.includes(item.id) ? { ...item, read: false } : item,
      );
      this.persist(updated);
      return updated;
    });
    this.selectedIds.set([]);
  }

  deleteSelected(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    this.notifications.update((items) => {
      const updated = items.filter((item) => !selected.includes(item.id));
      this.persist(updated);
      return updated;
    });
    this.selectedIds.set([]);
  }

  // Bulk Selection Toggles
  toggleSelectId(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  selectAllCurrentPage(): void {
    const currentPageIds = this.paginatedNotifications().map((n) => n.id);
    const currentSelected = this.selectedIds();
    const allSelected = currentPageIds.every((id) => currentSelected.includes(id));

    if (allSelected) {
      this.selectedIds.update((ids) => ids.filter((id) => !currentPageIds.includes(id)));
    } else {
      const newSet = new Set([...currentSelected, ...currentPageIds]);
      this.selectedIds.set(Array.from(newSet));
    }
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  // Search & Filter setters
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setStatusFilter(filter: NotificationReadFilter): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
  }

  setCategoryFilter(category: NotificationCategory | 'all'): void {
    this.categoryFilter.set(category);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setItemsPerPage(perPage: number): void {
    this.itemsPerPage.set(perPage);
    this.currentPage.set(1);
  }

  // Details Modal Control
  openDetails(notification: AppNotification): void {
    // Automatically mark as read when inspecting details
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
    this.activeNotification.set(notification);
  }

  closeDetails(): void {
    this.activeNotification.set(null);
  }

  // System Event Simulation
  simulateEvent(eventPreset?: 'estoque' | 'importacao' | 'oem' | 'catalogo'): AppNotification {
    const presets: Omit<AppNotification, 'id' | 'createdAt' | 'timestamp' | 'read'>[] = [
      {
        title: 'Estoque Baixo - Disco de Freio Fremax BD1402',
        description: 'Apenas 2 unidades restantes no depósito Zona Leste.',
        fullMessage:
          'O sistema de monitoramento automático de estoque registrou que o produto Disco de Freio Fremax BD1402 atingiu o nível crítico no depósito Zona Leste. Recomenda-se realizar pedido de transferência de estoque ou nova compra.',
        type: 'warning',
        category: 'estoque',
        priority: 'alta',
        link: '/commercial/inventory',
        relatedEntity: {
          module: 'Estoque',
          entityId: 'PROD-BD1402',
          route: '/commercial/inventory',
          label: 'Ver Estoque Zona Leste',
        },
      },
      {
        title: 'Processamento de Catálogo Nakata Concluído',
        description: 'Sincronização de 540 amortecedores e kits de suspensão realizada.',
        fullMessage:
          'A rotina de atualização do parceiro Nakata foi finalizada com êxito. Todos os 540 itens tiveram suas tabelas de dimensões e fotos associadas atualizadas para a versão 2026.',
        type: 'success',
        category: 'catalogo',
        priority: 'media',
        link: '/catalog/products',
        relatedEntity: {
          module: 'Catálogo',
          entityId: 'SYNC-NAKATA-01',
          route: '/catalog/products',
          label: 'Ver Produtos Atualizados',
        },
      },
      {
        title: 'Novo Cruzamento OEM Validado pelo Sistema',
        description: 'OEM Fiat 55268021 vinculado ao Filtro de Ar Tecfil ARL4152.',
        fullMessage:
          'O algoritmo de validação automática cruzou dados da montadora Fiat e confirmou a aplicação exata para os motores Firefly 1.0 e 1.3 Flex. Mapeamento ativado no catálogo.',
        type: 'info',
        category: 'compatibilidade',
        priority: 'baixa',
        link: '/compatibility/oem-codes',
        relatedEntity: {
          module: 'Compatibilidade OEM',
          entityId: 'OEM-55268021',
          route: '/compatibility/oem-codes',
          label: 'Ver Mapeamento',
        },
      },
      {
        title: 'Erro de Validação na Importação #9012',
        description: 'Falha ao processar 12 linhas com códigos de barras duplicados.',
        fullMessage:
          'A rotina automatizada de importação de arquivos CSV encontrou 12 linhas contendo EAN-13 duplicados na planilha tabela_fornecedor_2026.csv. Os itens foram isolados para correção manual.',
        type: 'error',
        category: 'importacao',
        priority: 'alta',
        link: '/imports',
        relatedEntity: {
          module: 'Importações',
          entityId: 'IMP-ERR-9012',
          route: '/imports',
          label: 'Resolver Inconformidades',
        },
      },
    ];

    let chosen = presets[Math.floor(Math.random() * presets.length)];
    if (eventPreset === 'estoque') chosen = presets[0];
    if (eventPreset === 'catalogo') chosen = presets[1];
    if (eventPreset === 'oem') chosen = presets[2];
    if (eventPreset === 'importacao') chosen = presets[3];

    const newNotification: AppNotification = {
      ...chosen,
      id: 'notif-sim-' + Date.now(),
      createdAt: new Date().toISOString(),
      timestamp: 'Agora mesmo',
      read: false,
    };

    this.notifications.update((items) => {
      const updated = [newNotification, ...items];
      this.persist(updated);
      return updated;
    });

    return newNotification;
  }

  resetToDefaults(): void {
    this.notifications.set(this.defaultNotifications);
    this.selectedIds.set([]);
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.categoryFilter.set('all');
    this.currentPage.set(1);
    this.persist(this.defaultNotifications);
  }
}
