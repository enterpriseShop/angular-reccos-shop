import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../design-system/page-header/page-header';
import { ToolbarComponent } from '../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../design-system/input/search-input';
import { ButtonComponent } from '../design-system/button/button';
import { DataTableComponent, ColumnDef } from '../design-system/data-table/data-table';
import { ToastService } from '../core/services/toast';

export interface PlaceholderRowItem extends Record<string, unknown> {
  code: string;
  name: string;
  category: string;
  updatedAt: string;
  status: string;
}

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ToolbarComponent,
    SearchInputComponent,
    ButtonComponent,
    DataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './placeholder.html',
  styleUrl: './placeholder.css',
})
export class PlaceholderPageComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);

  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly currentUrl = computed(() => this.router.url);

  readonly pageDetails = computed(() => {
    const url = this.currentUrl();

    if (url.includes('categories')) {
      return {
        title: 'Categorias de Produtos',
        subtitle: 'Estruturação hierárquica do catálogo de autopeças Reccos Shop',
        buttonText: 'Nova Categoria',
        breadcrumbs: [{ label: 'Catálogo', route: '/catalog/products' }, { label: 'Categorias' }],
      };
    } else if (url.includes('manufacturers')) {
      return {
        title: 'Fabricantes Homologados',
        subtitle: 'Cadastro de indústrias, marcas e sistemistas automotivos',
        buttonText: 'Novo Fabricante',
        breadcrumbs: [{ label: 'Catálogo', route: '/catalog/products' }, { label: 'Fabricantes' }],
      };
    } else if (url.includes('oem')) {
      return {
        title: 'Códigos OEM & Equivalência',
        subtitle: 'Indexação de números originais de montadoras e conversão cruzada',
        buttonText: 'Novo Código OEM',
        breadcrumbs: [{ label: 'Compatibilidade' }, { label: 'OEM Codes' }],
      };
    } else if (url.includes('brands') || url.includes('vehicles')) {
      return {
        title: 'Montadoras & Veículos',
        subtitle: 'Base de dados de marcas, modelos, versões e motores',
        buttonText: 'Nova Montadora',
        breadcrumbs: [{ label: 'Veículos' }, { label: 'Montadoras' }],
      };
    } else if (url.includes('inventory') || url.includes('commercial')) {
      return {
        title: 'Gestão de Estoque & Depósitos',
        subtitle: 'Saldos físicos, locação em prateleiras e depósitos centralizados',
        buttonText: 'Ajustar Saldo',
        breadcrumbs: [{ label: 'Comercial' }, { label: 'Estoque' }],
      };
    } else if (url.includes('imports')) {
      return {
        title: 'Central de Importações',
        subtitle: 'Processamento de planilhas Excel/CSV e atualização massiva de preços',
        buttonText: 'Nova Importação',
        breadcrumbs: [{ label: 'Importações' }],
      };
    } else if (url.includes('reports')) {
      return {
        title: 'Relatórios Gerenciais',
        subtitle: 'Análises de curva ABC, giro de peças e lacunas de catálogo',
        buttonText: 'Gerar Relatório',
        breadcrumbs: [{ label: 'Relatórios' }],
      };
    } else if (url.includes('admin')) {
      return {
        title: 'Administração do Sistema',
        subtitle: 'Permissões de acesso, logs de auditoria e configurações globais',
        buttonText: 'Novo Usuário',
        breadcrumbs: [{ label: 'Administração' }],
      };
    } else {
      return {
        title: 'Módulo Reccos Shop',
        subtitle: 'Estrutura padrão de módulo integrada ao Application Shell',
        buttonText: 'Novo Item',
        breadcrumbs: [{ label: 'Sistema' }],
      };
    }
  });

  readonly columns: ColumnDef<PlaceholderRowItem>[] = [
    { key: 'code', header: 'Código', width: '120px' },
    { key: 'name', header: 'Descrição / Item' },
    { key: 'category', header: 'Grupo', width: '180px' },
    { key: 'updatedAt', header: 'Última Atualização', width: '160px' },
    { key: 'status', header: 'Status', width: '120px', align: 'center' },
  ];

  readonly mockData: PlaceholderRowItem[] = [
    {
      code: 'ITEM-001',
      name: 'Sistemas de Freios ABS / Disc / Pad',
      category: 'Sistemas Ativos',
      updatedAt: '27/07/2026 10:14',
      status: 'Ativo',
    },
    {
      code: 'ITEM-002',
      name: 'Kits de Distribuição e Correias Sincronizadoras',
      category: 'Transmissão',
      updatedAt: '27/07/2026 09:30',
      status: 'Ativo',
    },
    {
      code: 'ITEM-003',
      name: 'Conjunto de Amortecedores e Molas Helicoidais',
      category: 'Suspensão',
      updatedAt: '26/07/2026 18:22',
      status: 'Ativo',
    },
    {
      code: 'ITEM-004',
      name: 'Sistema de Ignição e Injeção Eletrônica Flex',
      category: 'Elétrica',
      updatedAt: '25/07/2026 14:10',
      status: 'Ativo',
    },
    {
      code: 'ITEM-005',
      name: 'Filtros de Lubrificantes, Ar e Combustível',
      category: 'Manutenção',
      updatedAt: '24/07/2026 11:05',
      status: 'Ativo',
    },
    {
      code: 'ITEM-006',
      name: 'Sensores de Rotação, Oxigênio e Pressão MAP',
      category: 'Injeção',
      updatedAt: '24/07/2026 08:12',
      status: 'Ativo',
    },
    {
      code: 'ITEM-007',
      name: 'Kits de Embreagem Cobre / Aço Orgânica',
      category: 'Transmissão',
      updatedAt: '23/07/2026 16:45',
      status: 'Ativo',
    },
    {
      code: 'ITEM-008',
      name: "Bombas d'Água e Termostatos de Arrefecimento",
      category: 'Motor',
      updatedAt: '23/07/2026 12:20',
      status: 'Ativo',
    },
    {
      code: 'ITEM-009',
      name: 'Radiadores e Ventoinhas do Ar-Condicionado',
      category: 'Climatização',
      updatedAt: '22/07/2026 17:00',
      status: 'Inativo',
    },
    {
      code: 'ITEM-010',
      name: 'Terminais de Direção e Pivôs de Suspensão',
      category: 'Direção',
      updatedAt: '22/07/2026 10:15',
      status: 'Ativo',
    },
    {
      code: 'ITEM-011',
      name: 'Bujões e Juntas de Vedação de Aço Inox',
      category: 'Motor',
      updatedAt: '21/07/2026 15:30',
      status: 'Ativo',
    },
    {
      code: 'ITEM-012',
      name: 'Faróis Principais e DRL em LED Alta Intensidade',
      category: 'Iluminação',
      updatedAt: '21/07/2026 09:10',
      status: 'Ativo',
    },
  ];

  readonly filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.mockData;
    return this.mockData.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  });

  readonly paginatedData = computed(() => {
    const all = this.filteredData();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onAction(actionName: string): void {
    this.toastService.info(actionName, `Ação realizada no módulo ${this.pageDetails().title}.`);
  }
}
