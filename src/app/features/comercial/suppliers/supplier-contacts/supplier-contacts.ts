import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { ButtonComponent } from '../../../../design-system/button/button';
import { InputComponent } from '../../../../design-system/input/input';
import { DialogComponent } from '../../../../design-system/dialog/dialog';
import { ConfirmDialogComponent } from '../../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../../design-system/input/search-input';
import { ToastService } from '../../../../core/services/toast';
import { SupplierContactService } from '../../../../core/services/supplier-contact';
import {
  SupplierContact,
  SupplierContactDepartment,
  SUPPLIER_CONTACT_DEPARTMENTS,
  CreateSupplierContactPayload,
} from '../../../../core/models/supplier-contact/supplier-contact-response.model';

const DEFAULT_SAMPLE_CONTACTS: SupplierContact[] = [
  {
    id: 'cnt-1',
    supplier_id: 'sup-1',
    name: 'João Silva',
    role: 'Gerente Comercial',
    department: 'commercial',
    email: 'joao@empresa.com.br',
    phone: '(16) 3333-1111',
    extension: '102',
    mobile: '(16) 99999-9999',
    has_whatsapp: true,
    is_primary: true,
    active: true,
    notes: 'Responsável por negociações da linha pesada e tabelas de desconto.',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cnt-2',
    supplier_id: 'sup-1',
    name: 'Maria Oliveira',
    role: 'Analista de Faturamento',
    department: 'financial',
    email: 'maria@empresa.com.br',
    phone: '(16) 3333-2222',
    extension: '205',
    mobile: '(16) 98888-2222',
    has_whatsapp: false,
    is_primary: false,
    active: true,
    notes: 'Boletos, notas fiscais e prorrogações de vencimento.',
    created_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 'cnt-3',
    supplier_id: 'sup-1',
    name: 'Carlos Souza',
    role: 'Supervisor de Logística',
    department: 'logistics',
    email: 'carlos@empresa.com.br',
    phone: '(16) 3333-3333',
    extension: '310',
    mobile: '(16) 97777-3333',
    has_whatsapp: true,
    is_primary: false,
    active: false,
    notes: 'Contato anterior do centro de distribuição.',
    created_at: '2025-11-20T09:00:00Z',
  },
];

@Component({
  selector: 'app-supplier-contacts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppIconComponent,
    ButtonComponent,
    InputComponent,
    DialogComponent,
    ConfirmDialogComponent,
    SearchInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-contacts.html',
})
export class SupplierContactsComponent implements OnInit {
  private contactService = inject(SupplierContactService, { optional: true });
  private toastService = inject(ToastService, { optional: true });

  // Inputs
  readonly supplierId = input<string>('sup-1');
  readonly supplierName = input<string>('Auto Peças Brasil');
  readonly supplierActive = input<boolean>(true);
  readonly isReadOnly = input<boolean>(false);
  readonly initialContacts = input<SupplierContact[] | null>(null);

  // Outputs para integração externa
  readonly contactsChange = output<SupplierContact[]>();
  readonly contactSaved = output<SupplierContact>();

  // Estado da listagem
  readonly contacts = signal<SupplierContact[]>([]);
  readonly searchQuery = signal<string>('');
  readonly selectedDepartmentFilter = signal<string>('all');
  readonly selectedStatusFilter = signal<'all' | 'active' | 'inactive'>('all');

  // Estado do Modal de Edição/Criação
  readonly isModalOpen = signal<boolean>(false);
  readonly editingContactId = signal<string | null>(null);

  // Form State
  readonly formName = signal<string>('');
  readonly formDepartment = signal<SupplierContactDepartment>('commercial');
  readonly formRole = signal<string>('');
  readonly formEmail = signal<string>('');
  readonly formPhone = signal<string>('');
  readonly formExtension = signal<string>('');
  readonly formMobile = signal<string>('');
  readonly formHasWhatsapp = signal<boolean>(true);
  readonly formIsPrimary = signal<boolean>(false);
  readonly formActive = signal<boolean>(true);
  readonly formNotes = signal<string>('');
  readonly formErrors = signal<Record<string, string>>({});

  // Estado do Modal de Exclusão
  readonly isDeleteDialogOpen = signal<boolean>(false);
  readonly contactToDelete = signal<SupplierContact | null>(null);

  // Opções de Departamentos
  readonly departmentOptions = SUPPLIER_CONTACT_DEPARTMENTS;

  // Computeds
  readonly totalCount = computed(() => this.contacts().length);
  readonly activeCount = computed(() => this.contacts().filter((c) => c.active).length);
  readonly primaryContact = computed(() => this.contacts().find((c) => c.is_primary && c.active));

  readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const dept = this.selectedDepartmentFilter();
    const status = this.selectedStatusFilter();

    return this.contacts().filter((c) => {
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.role && c.role.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)) ||
        (c.mobile && c.mobile.includes(query));

      const matchDept = dept === 'all' || c.department === dept;

      const matchStatus =
        status === 'all' ||
        (status === 'active' && c.active) ||
        (status === 'inactive' && !c.active);

      return matchQuery && matchDept && matchStatus;
    });
  });

  ngOnInit(): void {
    if (this.initialContacts() && this.initialContacts()!.length > 0) {
      this.contacts.set(this.initialContacts()!);
    } else {
      this.loadContacts();
    }
  }

  loadContacts(): void {
    const sId = this.supplierId();
    if (this.contactService && sId && sId !== 'sup-1') {
      this.contactService.getAll(sId).subscribe({
        next: (res) => {
          this.contacts.set(res.data || []);
          this.contactsChange.emit(this.contacts());
        },
        error: () => {
          this.contacts.set(DEFAULT_SAMPLE_CONTACTS);
          this.contactsChange.emit(this.contacts());
        },
      });
    } else {
      this.contacts.set(DEFAULT_SAMPLE_CONTACTS);
      this.contactsChange.emit(this.contacts());
    }
  }

  getDepartmentBadge(dept: SupplierContactDepartment): string {
    const found = SUPPLIER_CONTACT_DEPARTMENTS.find((d) => d.value === dept);
    return (
      found?.badgeClass ||
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
    );
  }

  getDepartmentLabel(dept: SupplierContactDepartment): string {
    const found = SUPPLIER_CONTACT_DEPARTMENTS.find((d) => d.value === dept);
    return found?.label || dept;
  }

  getWhatsAppLink(mobile: string | null | undefined): string {
    if (!mobile) return '#';
    const digits = mobile.replace(/\D/g, '');
    const phoneWithCountry = digits.startsWith('55') ? digits : `55${digits}`;
    return `https://wa.me/${phoneWithCountry}`;
  }

  // Abertura do Modal de Cadastro / Edição
  openCreateModal(): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(null);
    this.formName.set('');
    this.formDepartment.set('commercial');
    this.formRole.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formExtension.set('');
    this.formMobile.set('');
    this.formHasWhatsapp.set(true);
    // Se for o primeiro contato, sugere como principal
    this.formIsPrimary.set(this.contacts().length === 0);
    this.formActive.set(true);
    this.formNotes.set('');
    this.formErrors.set({});
    this.isModalOpen.set(true);
  }

  openEditModal(contact: SupplierContact): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(contact.id);
    this.formName.set(contact.name);
    this.formDepartment.set(contact.department);
    this.formRole.set(contact.role || '');
    this.formEmail.set(contact.email);
    this.formPhone.set(contact.phone || '');
    this.formExtension.set(contact.extension || '');
    this.formMobile.set(contact.mobile || '');
    this.formHasWhatsapp.set(contact.has_whatsapp);
    this.formIsPrimary.set(contact.is_primary);
    this.formActive.set(contact.active);
    this.formNotes.set(contact.notes || '');
    this.formErrors.set({});
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingContactId.set(null);
  }

  // Validação e Salvamento
  saveContact(): void {
    const errors: Record<string, string> = {};

    if (!this.formName().trim()) {
      errors['name'] = 'Nome completo é obrigatório.';
    }

    if (!this.formEmail().trim()) {
      errors['email'] = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formEmail().trim())) {
      errors['email'] = 'Formato de e-mail inválido.';
    }

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    const payload: CreateSupplierContactPayload = {
      supplier_id: this.supplierId(),
      name: this.formName().trim(),
      department: this.formDepartment(),
      role: this.formRole().trim() || null,
      email: this.formEmail().trim().toLowerCase(),
      phone: this.formPhone().trim() || null,
      extension: this.formExtension().trim() || null,
      mobile: this.formMobile().trim() || null,
      has_whatsapp: this.formHasWhatsapp(),
      is_primary: this.formIsPrimary(),
      active: this.formActive(),
      notes: this.formNotes().trim() || null,
    };

    const editId = this.editingContactId();

    if (editId) {
      // Atualizar contato existente
      this.contacts.update((list) =>
        list.map((c) => {
          if (c.id === editId) {
            return {
              ...c,
              ...payload,
              updated_at: new Date().toISOString(),
            };
          }
          // Regra: se o editado virou principal, desmarca os demais
          if (payload.is_primary) {
            return { ...c, is_primary: false };
          }
          return c;
        }),
      );
      this.toastService?.success('Sucesso', 'Contato atualizado com sucesso.');
    } else {
      // Criar novo contato
      const newContact: SupplierContact = {
        ...payload,
        id: 'cnt-' + Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.contacts.update((list) => {
        const updatedList = payload.is_primary
          ? list.map((c) => ({ ...c, is_primary: false }))
          : [...list];
        return [newContact, ...updatedList];
      });

      this.toastService?.success('Sucesso', 'Contato adicionado com sucesso.');
    }

    this.contactsChange.emit(this.contacts());
    this.closeModal();
  }

  // Alternar Status (Ativar / Desativar)
  toggleStatus(contact: SupplierContact): void {
    if (this.isReadOnly()) return;
    const newStatus = !contact.active;

    this.contacts.update((list) =>
      list.map((c) => {
        if (c.id === contact.id) {
          // Se for desativado e era o principal, deixa de ser o principal ativo
          return {
            ...c,
            active: newStatus,
            is_primary: newStatus ? c.is_primary : false,
          };
        }
        return c;
      }),
    );

    const msg = newStatus ? 'Contato reativado com sucesso.' : 'Contato desativado com sucesso.';
    this.toastService?.info('Status alterado', msg);
    this.contactsChange.emit(this.contacts());
  }

  // Definir como Contato Principal
  setAsPrimary(contact: SupplierContact): void {
    if (this.isReadOnly() || !contact.active) return;

    this.contacts.update((list) =>
      list.map((c) => ({
        ...c,
        is_primary: c.id === contact.id,
      })),
    );

    this.toastService?.success(
      'Principal Definido',
      `${contact.name} agora é o contato principal.`,
    );
    this.contactsChange.emit(this.contacts());
  }

  // Exclusão
  confirmDelete(contact: SupplierContact): void {
    if (this.isReadOnly()) return;
    this.contactToDelete.set(contact);
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const contact = this.contactToDelete();
    if (contact) {
      this.contacts.update((list) => list.filter((c) => c.id !== contact.id));
      this.toastService?.success('Excluído', 'Contato removido com sucesso.');
      this.contactsChange.emit(this.contacts());
    }
    this.isDeleteDialogOpen.set(false);
    this.contactToDelete.set(null);
  }
}
