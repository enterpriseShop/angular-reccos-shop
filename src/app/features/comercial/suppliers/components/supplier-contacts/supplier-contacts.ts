import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users } from 'lucide-angular';
import { SearchInputComponent } from '../../../../../design-system/input/search-input';
import { SelectComponent } from '../../../../../design-system/select/select';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../../../design-system/dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../../../design-system/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../../design-system/error-state/error-state';
import { SupplierContactModalComponent } from '../supplier-contact-modal/supplier-contact-modal';
import { SupplierService } from '../../../../../core/services/supplier';
import { ToastService } from '../../../../../core/services/toast';
import { SupplierContactResponse } from '../../../../../core/models/supplier-contact/supplier-contact-response.model';
import { SupplierContactService } from '../../../../../core/services/supplier-contact';
import { SupplierContactFiltersRequest } from '../../../../../core/models/supplier-contact/supplier-contact-filter-request.model';
import { ActivatedRoute } from '@angular/router';
import { SupplierContactsCard } from '../suplier-contacts-card/supplier-contacts-card';
import { SUPPLIER_CONTACT_DEPARTMENTS } from '../../../../../utils/supplier-contact-depto';
import { StatusStore } from '../../../../../core/store/status-store/status-store';
import { SupplierContactDepartment } from '../../../../../core/models/supplier-contact/supplier-contact-depto.model';

@Component({
  selector: 'app-supplier-contacts',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    SearchInputComponent,
    SelectComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SupplierContactModalComponent,
    SupplierContactsCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-contacts.html',
})
export class SupplierContactsComponent {
  private statusStore = inject(StatusStore);
  private readonly actvRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly supplierService = inject(SupplierService);
  private readonly supplierContactService = inject(SupplierContactService);

  readonly supplierName = input<string>('');
  readonly supplierActive = input<boolean>(true);

  readonly contactsChanged = output<void>();

  readonly supplierId = signal<string>('');
  readonly loadingSignal = signal<boolean>(false);
  readonly errorSignal = signal<string | null>(null);
  readonly actionLoadingIdSignal = signal<string | null>(null);
  readonly contacts = signal<SupplierContactResponse[]>([]);
  readonly searchQuerySignal = signal<string>('');
  readonly statusFilterSignal = signal<string>('');
  readonly departmentFilterSignal = signal<SupplierContactDepartment>('all');
  readonly isModalOpenSignal = signal<boolean>(false);
  readonly selectedContactForEditSignal = signal<SupplierContactResponse | null>(null);
  readonly deleteDialogOpenSignal = signal<boolean>(false);
  readonly selectedContactForDeleteSignal = signal<SupplierContactResponse | null>(null);
  private readonly currentPage = signal<number>(1);
  private readonly perPage = signal<number>(10);

  readonly icons = {
    Users,
  };

  readonly statusOptions = computed(() => {
    const options = this.statusStore.statusOptions().filter((m) => m.module === 'SUPPLIER_CONTACT');
    return options;
  });

  readonly departmentSelectOptions = computed(() => [
    { label: 'Todos os Departamentos', value: '', sublabel: '', module: '', disabled: false },
    ...SUPPLIER_CONTACT_DEPARTMENTS.map((d) => ({
      label: d.label,
      value: d.value,
      sublabel: '',
      module: '',
      disabled: false,
    })),
  ]);

  // Computed Counters
  readonly totalContactsCount = computed(() => this.contacts().length);
  readonly activeContactsCount = computed(
    () => this.contacts().filter((c) => c.active !== false).length,
  );
  readonly inactiveContactsCount = computed(
    () => this.contacts().filter((c) => c.active === false).length,
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchQuerySignal().trim().length > 0 ||
      this.statusFilterSignal() !== '' ||
      this.departmentFilterSignal() !== 'all',
  );

  readonly deleteDialogMessage = computed(() => {
    const c = this.selectedContactForDeleteSignal();
    if (!c) return '';
    return `Tem certeza de que deseja excluir permanentemente o contato "${c.name}"? Como boa prática, recomendamos desativar o contato em vez de excluir para preservar o histórico comercial.`;
  });

  params: SupplierContactFiltersRequest = {
    search: null,
    active: null,
    is_primary: null,
    department: 'all',
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  constructor() {
    effect(() => {
      this.supplierId.set(this.actvRoute.snapshot.params['contactId']);
      const id = this.supplierId();
      if (id) {
        this.loadContacts(id, this.params);
      }
    });
  }

  loadContacts(supId: string = this.supplierId(), params: SupplierContactFiltersRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.supplierContactService.getAll(supId, params).subscribe({
      next: (res) => {
        this.contacts.set(res.data || []);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(
          err.error?.message ||
            err.message ||
            'Não foi possível carregar os contatos do fornecedor.',
        );
      },
    });
  }

  normalizeParams(): void {
    this.params = {
      active: null,
      is_primary: null,
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.searchQuerySignal(),
      department: this.departmentFilterSignal(),
    };
    this.loadContacts(this.supplierId(), this.params);
  }

  onSearchChange(query: string): void {
    this.perPage.set(10);
    this.currentPage.set(1);
    this.searchQuerySignal.set(query);
    this.normalizeParams();
  }

  onStatusFilterChange(status: string): void {
    this.perPage.set(10);
    this.currentPage.set(1);
    this.statusFilterSignal.set(status);
    this.normalizeParams();
  }

  onDepartmentFilterChange(department: string): void {
    console.log('department', department);
    this.perPage.set(10);
    this.currentPage.set(1);
    this.departmentFilterSignal.set(department as SupplierContactDepartment);
    this.normalizeParams();
  }

  resetFilters(): void {
    this.searchQuerySignal.set('');
    this.statusFilterSignal.set('all');
    this.departmentFilterSignal.set('all');
  }

  openAddModal(): void {
    this.selectedContactForEditSignal.set(null);
    this.isModalOpenSignal.set(true);
  }

  openEditModal(contact: SupplierContactResponse): void {
    this.selectedContactForEditSignal.set(contact);
    this.isModalOpenSignal.set(true);
  }

  closeModal(): void {
    this.isModalOpenSignal.set(false);
    this.selectedContactForEditSignal.set(null);
  }

  onContactSaved(): void {
    this.loadContacts(this.supplierId(), this.params);
    this.contactsChanged.emit();
  }

  toggleStatus(contact: SupplierContactResponse): void {
    const nextActive = !(contact.active !== false);
    const wasPrimary = contact.is_primary;

    this.actionLoadingIdSignal.set(contact.id);
    this.supplierContactService.toggleStatus(this.supplierId(), contact.id, nextActive).subscribe({
      next: (res) => {
        this.actionLoadingIdSignal.set(null);
        const updated = res.data;
        this.contacts.update((list) =>
          list.map((item) => (item.id === contact.id ? { ...item, ...updated } : item)),
        );

        if (!nextActive && wasPrimary) {
          this.toastService.info(
            'Contato desativado',
            `${contact.name} foi desativado e deixou de ser o contato principal.`,
          );
        } else {
          this.toastService.success(
            nextActive ? 'Contato reativado' : 'Contato desativado',
            nextActive
              ? `${contact.name} está ativo novamente para comunicações.`
              : `${contact.name} foi marcado como inativo e mantido no histórico.`,
          );
        }
        this.contactsChanged.emit();
      },
      error: (err) => {
        this.actionLoadingIdSignal.set(null);
        this.toastService.error(
          'Erro ao alterar status',
          err.error?.message || 'Não foi possível atualizar o status do contato.',
        );
      },
    });
  }

  promoteToPrimary(contact: SupplierContactResponse): void {
    if (contact.is_primary || contact.active === false) return;

    this.actionLoadingIdSignal.set(contact.id);
    this.supplierContactService.setPrimaryContact(this.supplierId(), contact.id).subscribe({
      next: () => {
        this.actionLoadingIdSignal.set(null);
        this.contacts.update((list) =>
          list.map((item) => ({
            ...item,
            is_primary: item.id === contact.id,
          })),
        );
        this.toastService.success(
          'Contato principal definido',
          `${contact.name} agora é o contato padrão para pedidos e avisos.`,
        );
        this.contactsChanged.emit();
      },
      error: (err) => {
        this.actionLoadingIdSignal.set(null);
        this.toastService.error(
          'Erro ao definir principal',
          err.error?.message || 'Não foi possível definir o contato principal.',
        );
      },
    });
  }

  confirmDelete(contact: SupplierContactResponse): void {
    this.selectedContactForDeleteSignal.set(contact);
    this.deleteDialogOpenSignal.set(true);
  }

  executeDelete(): void {
    const contact = this.selectedContactForDeleteSignal();
    if (!contact) return;

    this.actionLoadingIdSignal.set(contact.id);
    this.supplierContactService.delete(this.supplierId(), contact.id).subscribe({
      next: () => {
        this.actionLoadingIdSignal.set(null);
        this.deleteDialogOpenSignal.set(false);
        this.selectedContactForDeleteSignal.set(null);
        this.contacts.update((list) => list.filter((c) => c.id !== contact.id));
        this.toastService.success(
          'Contato excluído',
          `${contact.name} foi removido permanentemente do fornecedor.`,
        );
        this.contactsChanged.emit();
      },
      error: (err) => {
        this.actionLoadingIdSignal.set(null);
        this.deleteDialogOpenSignal.set(false);
        this.toastService.error(
          'Erro ao excluir contato',
          err.error?.message || 'Não foi possível remover o contato.',
        );
      },
    });
  }
}
