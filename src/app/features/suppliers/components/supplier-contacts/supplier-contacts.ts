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
import {
  LucideAngularModule,
  Plus,
  Star,
  Mail,
  Phone,
  Smartphone,
  MessageCircle,
  Edit3,
  Power,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Briefcase,
  FileText,
  ExternalLink,
} from 'lucide-angular';
import { SearchInputComponent } from '../../../../design-system/input/search-input';
import { SelectComponent } from '../../../../design-system/select/select';
import { ButtonComponent } from '../../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../../design-system/dialog/confirm-dialog';
import { EmptyStateComponent } from '../../../../design-system/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../design-system/error-state/error-state';
import { SupplierContactModalComponent } from '../supplier-contact-modal/supplier-contact-modal';
import { SupplierService } from '../../../../core/services/supplier';
import { ToastService } from '../../../../core/services/toast';
import { SupplierContactResponse } from '../../../../core/models/supplier-contact/supplier-contact-response.model';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';
import { SupplierContactService } from '../../../../core/services/supplier-contact';
import { SupplierContactFiltersRequest } from '../../../../core/models/supplier-contact/supplier-contact-filter-request.model';

export type ContactStatusFilter = 'all' | 'active' | 'inactive';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-contacts.html',
})
export class SupplierContactsComponent {
  private readonly toastService = inject(ToastService);
  private readonly supplierService = inject(SupplierService);
  private readonly supplierContactService = inject(SupplierContactService);

  readonly supplierId = input.required<string>();
  readonly supplierName = input<string>('');
  readonly supplierActive = input<boolean>(true);

  readonly contactsChanged = output<void>();

  // State Signals
  readonly contactsSignal = signal<SupplierContactResponse[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly errorSignal = signal<string | null>(null);
  readonly actionLoadingIdSignal = signal<string | null>(null);

  // Filter Signals
  readonly searchQuerySignal = signal<string>('');
  readonly statusFilterSignal = signal<ContactStatusFilter>('all');
  readonly departmentFilterSignal = signal<string>('');

  // Modal State Signals
  readonly isModalOpenSignal = signal<boolean>(false);
  readonly selectedContactForEditSignal = signal<SupplierContactResponse | null>(null);

  // Delete Confirmation Dialog Signals
  readonly deleteDialogOpenSignal = signal<boolean>(false);
  readonly selectedContactForDeleteSignal = signal<SupplierContactResponse | null>(null);

  // Lucide Icons
  readonly icons = {
    Plus,
    Star,
    Mail,
    Phone,
    Smartphone,
    MessageCircle,
    Edit3,
    Power,
    Trash2,
    UserCheck,
    UserX,
    Users,
    Briefcase,
    FileText,
    ExternalLink,
  };

  readonly departmentSelectOptions: SelectOption[] = [
    // { label: 'Todos os Departamentos', value: '' },
    // ...SUPPLIER_CONTACT_DEPARTMENTS.map((d) => ({
    //   label: d.label,
    //   value: d.value,
    // })),
  ];

  // Computed Counters
  readonly totalContactsCount = computed(() => this.contactsSignal().length);
  readonly activeContactsCount = computed(
    () => this.contactsSignal().filter((c) => c.active !== false).length,
  );
  readonly inactiveContactsCount = computed(
    () => this.contactsSignal().filter((c) => c.active === false).length,
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchQuerySignal().trim().length > 0 ||
      this.statusFilterSignal() !== 'all' ||
      this.departmentFilterSignal() !== '',
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
  };

  constructor() {
    effect(() => {
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
        this.contactsSignal.set(res.data || []);
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

  onSearchChange(query: string): void {
    this.searchQuerySignal.set(query);
  }

  onStatusFilterChange(status: ContactStatusFilter): void {
    this.statusFilterSignal.set(status);
  }

  onDepartmentFilterChange(department: string): void {
    this.departmentFilterSignal.set(department);
  }

  resetFilters(): void {
    this.searchQuerySignal.set('');
    this.statusFilterSignal.set('all');
    this.departmentFilterSignal.set('');
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
        this.contactsSignal.update((list) =>
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
        this.contactsSignal.update((list) =>
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
        this.contactsSignal.update((list) => list.filter((c) => c.id !== contact.id));
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

  // Template Helpers (Pure & AOT-safe)
  getInitials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CT';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getDeptLabel(department: string | null | undefined): string {
    // return getDepartmentLabel(department);
    console.log(department);
    return department || '';
  }

  getWhatsAppUrl(mobile: string | null | undefined): string {
    const digits = (mobile || '').replace(/\D+/g, '');
    if (!digits) return '';
    const fullNumber = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
    return `https://wa.me/${fullNumber}`;
  }

  getTelUrl(phone: string | null | undefined): string {
    const digits = (phone || '').replace(/\D+/g, '');
    return digits ? `tel:+55${digits}` : '';
  }
}
