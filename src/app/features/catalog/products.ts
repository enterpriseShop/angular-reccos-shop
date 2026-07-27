import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../design-system/input/search-input';
import { SelectComponent } from '../../design-system/select/select';
import { ButtonComponent } from '../../design-system/button/button';
import { DataTableComponent, ColumnDef } from '../../design-system/data-table/data-table';
import { PaginationComponent } from '../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { ToastService } from '../../core/services/toast';

export interface ProductItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer: string;
  oemCode: string;
  price: string;
  stock: number;
  status: 'Ativo' | 'Inativo' | 'Baixo Estoque';
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ToolbarComponent,
    SearchInputComponent,
    SelectComponent,
    ButtonComponent,
    DataTableComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    AppIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsPageComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedProductForDelete = signal<ProductItem | null>(null);

  readonly allProducts = signal<ProductItem[]>([
    { id: '1', code: 'REC-10029', name: 'Jogo de Pastilhas de Freio Dianteira', category: 'Sistemas de Freios', manufacturer: 'Bosch', oemCode: '5U0698151A', price: 'R$ 189,90', stock: 45, status: 'Ativo' },
    { id: '2', code: 'REC-20491', name: 'Correia Dentada com Tensor Synchrobelt', category: 'Motor & Transmissão', manufacturer: 'Continental', oemCode: '030109119AB', price: 'R$ 245,00', stock: 3, status: 'Baixo Estoque' },
    { id: '3', code: 'REC-30112', name: 'Amortecedor Dianteiro Pressurizado HG', category: 'Suspensão & Direção', manufacturer: 'Monroe', oemCode: '5U0413031A', price: 'R$ 380,00', stock: 18, status: 'Ativo' },
    { id: '4', code: 'REC-40918', name: 'Vela de Ignição Iridium IX', category: 'Sistema Elétrico', manufacturer: 'NGK', oemCode: '04E905601B', price: 'R$ 68,50', stock: 120, status: 'Ativo' },
    { id: '5', code: 'REC-10882', name: 'Disco de Freio Ventilado Par', category: 'Sistemas de Freios', manufacturer: 'Fremax', oemCode: '5U0615301A', price: 'R$ 290,00', stock: 0, status: 'Inativo' },
    { id: '6', code: 'REC-50192', name: 'Filtro de Óleo Lubrificante Motor EA111', category: 'Motor & Transmissão', manufacturer: 'Mann Filter', oemCode: '030115561AN', price: 'R$ 38,90', stock: 85, status: 'Ativo' },
    { id: '7', code: 'REC-60183', name: 'Bomba de Combustível Elétrica Flex 4.2 Bar', category: 'Motor & Transmissão', manufacturer: 'Magneti Marelli', oemCode: '5U0919051A', price: 'R$ 310,00', stock: 12, status: 'Ativo' },
    { id: '8', code: 'REC-70812', name: 'Kit Embreagem Cobre e Aço 200mm', category: 'Motor & Transmissão', manufacturer: 'Sachs', oemCode: '030141025E', price: 'R$ 540,00', stock: 2, status: 'Baixo Estoque' },
    { id: '9', code: 'REC-10044', name: 'Cilindro Mestre de Freio Duplo', category: 'Sistemas de Freios', manufacturer: 'TRW', oemCode: '5U0611019B', price: 'R$ 215,00', stock: 14, status: 'Ativo' },
    { id: '10', code: 'REC-20381', name: 'Filtro de Ar do Motor Flex', category: 'Motor & Transmissão', manufacturer: 'Fram', oemCode: '030129620A', price: 'R$ 42,00', stock: 92, status: 'Ativo' },
    { id: '11', code: 'REC-30819', name: 'Terminal de Direção Lado Direito', category: 'Suspensão & Direção', manufacturer: 'Nakata', oemCode: '5U0423812A', price: 'R$ 78,00', stock: 33, status: 'Ativo' },
    { id: '12', code: 'REC-40112', name: 'Bobina de Ignição Eletrônica 4 Pinos', category: 'Sistema Elétrico', manufacturer: 'Bosch', oemCode: '036905715F', price: 'R$ 310,00', stock: 24, status: 'Ativo' },
    { id: '13', code: 'REC-50821', name: 'Radiador de Água do Motor com Ar', category: 'Motor & Transmissão', manufacturer: 'Valeo', oemCode: '5U0121253', price: 'R$ 495,00', stock: 8, status: 'Ativo' },
    { id: '14', code: 'REC-10992', name: 'Tambor de Freio Traseiro Unitário', category: 'Sistemas de Freios', manufacturer: 'Hipper Freios', oemCode: '5U0609617', price: 'R$ 135,00', stock: 21, status: 'Ativo' },
    { id: '15', code: 'REC-30441', name: 'Bieleta de Suspensão Dianteira', category: 'Suspensão & Direção', manufacturer: 'Cofap', oemCode: '5U0411315', price: 'R$ 58,00', stock: 4, status: 'Baixo Estoque' },
    { id: '16', code: 'REC-40788', name: 'Alternador de Energia 90A 12V', category: 'Sistema Elétrico', manufacturer: 'Denso', oemCode: '030903023J', price: 'R$ 890,00', stock: 6, status: 'Ativo' },
    { id: '17', code: 'REC-20998', name: 'Junta do Cabeçote de Aço Multilâminas', category: 'Motor & Transmissão', manufacturer: 'Taranto', oemCode: '030103383AL', price: 'R$ 110,00', stock: 19, status: 'Ativo' },
    { id: '18', code: 'REC-30221', name: 'Pivô de Suspensão Inferior Esquerdo', category: 'Suspensão & Direção', manufacturer: 'Viemar', oemCode: '5U0407365A', price: 'R$ 64,00', stock: 40, status: 'Ativo' },
    { id: '19', code: 'REC-10334', name: 'Sapatas de Freio Traseiro com Lona', category: 'Sistemas de Freios', manufacturer: 'Fras-le', oemCode: '5U0698525', price: 'R$ 115,00', stock: 16, status: 'Ativo' },
    { id: '20', code: 'REC-50319', name: 'Sensor de Oxigênio Sonda Lambda', category: 'Sistema Elétrico', manufacturer: 'NTK', oemCode: '030906262R', price: 'R$ 225,00', stock: 11, status: 'Ativo' },
    { id: '21', code: 'REC-20119', name: 'Válvula Termostática com Carcaça', category: 'Motor & Transmissão', manufacturer: 'MTE-Thomson', oemCode: '032121111CD', price: 'R$ 145,00', stock: 27, status: 'Ativo' },
    { id: '22', code: 'REC-30991', name: 'Kits Coxim do Amortecedor com Batente', category: 'Suspensão & Direção', manufacturer: 'Sampel', oemCode: '5U0412331', price: 'R$ 98,00', stock: 1, status: 'Baixo Estoque' },
    { id: '23', code: 'REC-40442', name: 'Motor de Partida Arrancada 1.0/1.6', category: 'Sistema Elétrico', manufacturer: 'Valeo', oemCode: '02T911023D', price: 'R$ 680,00', stock: 9, status: 'Ativo' },
    { id: '24', code: 'REC-20551', name: 'Filtro de Combustível Injeção Eletrônica', category: 'Motor & Transmissão', manufacturer: 'Tecfil', oemCode: '6Q0201051J', price: 'R$ 28,50', stock: 150, status: 'Ativo' },
    { id: '25', code: 'REC-10771', name: 'Servo Freio Hidrovácuo ATE', category: 'Sistemas de Freios', manufacturer: 'ATE', oemCode: '5U0612105A', price: 'R$ 410,00', stock: 7, status: 'Ativo' },
    { id: '26', code: 'REC-30661', name: 'Junta Homocinética Lado Roda', category: 'Suspensão & Direção', manufacturer: 'Spicer', oemCode: '5U0498099', price: 'R$ 230,00', stock: 15, status: 'Ativo' },
    { id: '27', code: 'REC-40889', name: 'Jogo de Cabos de Vela de Ignição Silicone', category: 'Sistema Elétrico', manufacturer: 'NGK', oemCode: '030905409AC', price: 'R$ 105,00', stock: 38, status: 'Ativo' },
    { id: '28', code: 'REC-50990', name: 'Eletroventilador do Radiador Completo', category: 'Motor & Transmissão', manufacturer: 'Notus', oemCode: '5U0959455A', price: 'R$ 320,00', stock: 0, status: 'Inativo' }
  ]);

  readonly columns: ColumnDef<ProductItem>[] = [
    { key: 'code', header: 'Código Reccos', width: '130px' },
    { key: 'name', header: 'Nome do Produto' },
    { key: 'category', header: 'Categoria', width: '170px' },
    { key: 'manufacturer', header: 'Fabricante', width: '140px' },
    { key: 'oemCode', header: 'Código OEM', width: '130px' },
    { key: 'price', header: 'Preço Venda', width: '120px', align: 'right' },
    { key: 'stock', header: 'Estoque', width: '90px', align: 'center' },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center',
      cell: (row) => row['status'] as string
    }
  ];

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory().toLowerCase();
    const st = this.selectedStatus();

    return this.allProducts().filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.oemCode.toLowerCase().includes(q);
      const matchesCat = !cat || p.category.toLowerCase().includes(cat);
      const matchesSt = !st || p.status === st;
      return matchesQ && matchesCat && matchesSt;
    });
  });

  readonly paginatedProducts = computed(() => {
    const all = this.filteredProducts();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  exportProducts(): void {
    this.toastService.success('Exportação Iniciada', 'Gerando arquivo Excel com os produtos do catálogo...');
  }

  newProduct(): void {
    this.router.navigate(['/catalog/products/new']);
  }

  editProduct(prod: ProductItem): void {
    this.router.navigate(['/catalog/products', prod.id, 'edit']);
  }

  confirmDelete(prod: ProductItem): void {
    this.selectedProductForDelete.set(prod);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const prod = this.selectedProductForDelete();
    if (prod) {
      this.allProducts.update(list => list.filter(p => p.id !== prod.id));
      this.toastService.success('Produto Excluído', `${prod.name} foi removido com sucesso.`);
    }
    this.deleteDialogOpen.set(false);
  }
}
