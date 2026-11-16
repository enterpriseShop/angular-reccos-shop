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
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { DrawerComponent } from '../../../../design-system/drawer/drawer';
import { SupplierService } from '../../../../core/services/supplier';
import { StatusService, StatusOption } from '../../../../core/services/status';
import { ToastService } from '../../../../core/services/toast';
import { brazilianStates } from '../../../../utils/barzilian-states';
import { IBrazilianState } from '../../../../core/models/generals/brazilian-states.model';
import { SupplierResponse } from '../../../../core/models/suppliers/supplier-response.model';
import { SUPPLIER_CONTACT_DEPARTMENTS } from '../../../../utils/supplier-contact-depto';
import { SupplierContactResponse } from '../../../../core/models/supplier-contact/supplier-contact-response.model';
import { SupplierContactRequest } from '../../../../core/models/supplier-contact/supplier-contact-request.model';
import { getDepartmentLabel } from '../../../../core/models/getDepto.model';

export const BRAZILIAN_STATES: readonly IBrazilianState[] = brazilianStates;

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.css',
})
export class SupplierFormComponent {
  private supplierService = inject(SupplierService);
  private statusService = inject(StatusService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly supplier = input<SupplierResponse | null>(null);

  readonly closeForm = output<void>();
  readonly supplierSaved = output<SupplierResponse>();
  readonly contactsUpdated = output<void>();
  readonly openContactsRequested = output<string>();

  readonly states = BRAZILIAN_STATES;
  readonly contactDepartments = SUPPLIER_CONTACT_DEPARTMENTS;

  // UI State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isSavingContact = signal<boolean>(false);
  readonly statusOptions = signal<StatusOption[]>([]);
  readonly formErrors = signal<Record<string, string>>({});

  // SupplierResponse Fields matching CreateSupplierRequest / UpdateSupplierRequest / SupplierResource
  readonly corporateName = signal<string>('');
  readonly tradeName = signal<string>('');
  readonly document = signal<string>('');
  readonly stateRegistration = signal<string>('');
  readonly statusId = signal<string>('st-02');

  readonly email = signal<string>('');
  readonly phone = signal<string>('');
  readonly website = signal<string>('');

  readonly zipCode = signal<string>('');
  readonly street = signal<string>('');
  readonly number = signal<string>('');
  readonly complement = signal<string>('');
  readonly neighborhood = signal<string>('');
  readonly city = signal<string>('');
  readonly state = signal<string>('');

  readonly notes = signal<string>('');

  // Contacts Collection & Inline Editor State
  readonly contacts = signal<SupplierContactResponse[]>([]);
  readonly contactEditorOpen = signal<boolean>(false);
  readonly editingContactId = signal<string | null>(null);
  readonly contactErrors = signal<Record<string, string>>({});

  readonly contactName = signal<string>('');
  readonly contactDepartment = signal<string>('commercial');
  readonly contactRole = signal<string>('');
  readonly contactEmail = signal<string>('');
  readonly contactPhone = signal<string>('');
  readonly contactExtension = signal<string>('');
  readonly contactMobile = signal<string>('');
  readonly contactHasWhatsapp = signal<boolean>(true);
  readonly contactIsPrimary = signal<boolean>(false);
  readonly contactNotes = signal<string>('');

  constructor() {
    this.loadStatuses();

    effect(() => {
      const open = this.isOpen();
      const current = this.supplier();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});
        this.resetContactEditor();

        if ((currentMode === 'edit' || currentMode === 'view') && current) {
          this.populateFromSupplier(current);

          // Fetch fresh full details including contacts from /api/suppliers/{id}
          this.supplierService.getById(current.id).subscribe({
            next: (res) => {
              if (res.data && this.isOpen() && this.supplier()?.id === current.id) {
                this.populateFromSupplier(res.data);
              }
            },
          });
        } else {
          this.resetSupplierFields();
        }
      }
    });
  }

  private populateFromSupplier(s: SupplierResponse): void {
    this.corporateName.set(s.corporate_name || '');
    this.tradeName.set(s.trade_name || '');
    this.document.set(s.document || '');
    this.stateRegistration.set(s.state_registration || '');
    this.statusId.set(s.status?.id || s.status?.id || '');
    this.email.set(s.email || '');
    this.phone.set(s.phone || '');
    this.website.set(s.website || '');
    this.zipCode.set(s.zip_code || '');
    this.street.set(s.street || '');
    this.number.set(s.number || '');
    this.complement.set(s.complement || '');
    this.neighborhood.set(s.neighborhood || '');
    this.city.set(s.city || '');
    this.state.set(s.state || '');
    this.notes.set(s.notes || '');
    this.contacts.set((s.contacts || []).map((c) => ({ ...c })));
  }

  private resetSupplierFields(): void {
    this.corporateName.set('');
    this.tradeName.set('');
    this.document.set('');
    this.stateRegistration.set('');
    this.statusId.set('st-02');
    this.email.set('');
    this.phone.set('');
    this.website.set('');
    this.zipCode.set('');
    this.street.set('');
    this.number.set('');
    this.complement.set('');
    this.neighborhood.set('');
    this.city.set('');
    this.state.set('');
    this.notes.set('');
    this.contacts.set([]);
  }

  private loadStatuses(): void {
    this.statusService.getOptions('PRODUCT').subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.statusOptions.set(res.data);
        } else {
          this.setDefaultStatuses();
        }
      },
      error: () => {
        this.setDefaultStatuses();
      },
    });
  }

  private setDefaultStatuses(): void {
    this.statusOptions.set([
      {
        id: 'st-02',
        label: 'Ativo',
        code: 'ACTIVE',
        color: '#16A34A',
        description: 'Fornecedor homologado para compras',
      },
      {
        id: 'st-03',
        label: 'Inativo',
        code: 'INACTIVE',
        color: '#DC2626',
        description: 'Fornecedor desativado temporariamente',
      },
      {
        id: 'st-04',
        label: 'Em Revisão',
        code: 'REVIEW',
        color: '#D97706',
        description: 'Aguardando homologação cadastral',
      },
    ]);
  }

  // Computed Derived State
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Fornecedor';
      case 'view':
        return 'Detalhes do Fornecedor';
      case 'create':
      default:
        return 'Novo Fornecedor';
    }
  });

  readonly drawerIcon = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'edit';
      case 'view':
        return 'eye';
      default:
        return 'building';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly currentStatus = computed(() => {
    const sId = this.statusId();
    return this.statusOptions().find((s) => s.id === sId);
  });

  readonly isActive = computed(() => {
    const st = this.currentStatus();
    if (!st) return true;
    return (st.code || '').toLowerCase() === 'active';
  });

  readonly displayHeaderName = computed(() => {
    return this.tradeName().trim() || this.corporateName().trim() || 'Novo Fornecedor Homologado';
  });

  readonly displayHeaderSubtitle = computed(() => {
    const doc = this.document().trim();
    const corp = this.corporateName().trim();
    if (this.tradeName().trim() && corp) {
      return doc ? `${corp} • ${doc}` : corp;
    }
    return doc || 'CNPJ / CPF NÃO INFORMADO';
  });

  // Field Input Handlers
  onInput(fieldSignal: { set: (val: string) => void }, errorKey: string, event: Event): void {
    const val = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    fieldSignal.set(val);
    this.clearError(errorKey);
  }

  onDocumentInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const digits = inputEl.value.replace(/\D/g, '').slice(0, 14);
    let formatted = digits;

    if (digits.length > 11) {
      // CNPJ: 00.000.000/0000-00
      formatted = digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else if (digits.length > 3) {
      // CPF: 000.000.000-00
      formatted = digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
    }

    inputEl.value = formatted;
    this.document.set(formatted);
    this.clearError('document');
  }

  onZipCodeInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const digits = inputEl.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    inputEl.value = formatted;
    this.zipCode.set(formatted);
    this.clearError('zip_code');
  }

  onPhoneInput(
    fieldSignal: { set: (val: string) => void },
    errorKey: string,
    event: Event,
    isContact = false,
  ): void {
    const inputEl = event.target as HTMLInputElement;
    const digits = inputEl.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;

    if (digits.length >= 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    } else if (digits.length >= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    inputEl.value = formatted;
    fieldSignal.set(formatted);
    if (isContact) {
      this.clearContactError(errorKey);
    } else {
      this.clearError(errorKey);
    }
  }

  selectStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.statusId.set(id);
    this.clearError('status_id');
  }

  private clearError(field: string): void {
    this.formErrors.update((errors) => {
      if (!errors[field]) return errors;
      const copy = { ...errors };
      delete copy[field];
      return copy;
    });
  }

  private clearContactError(field: string): void {
    this.contactErrors.update((errors) => {
      if (!errors[field]) return errors;
      const copy = { ...errors };
      delete copy[field];
      return copy;
    });
  }

  // Contact Sub-Resource Handlers (used for initial contacts during supplier creation)
  openNewContactEditor(): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(null);
    this.contactName.set('');
    this.contactDepartment.set('commercial');
    this.contactRole.set('');
    this.contactEmail.set('');
    this.contactPhone.set('');
    this.contactExtension.set('');
    this.contactMobile.set('');
    this.contactHasWhatsapp.set(true);
    this.contactIsPrimary.set(this.contacts().length === 0);
    this.contactNotes.set('');
    this.contactErrors.set({});
    this.contactEditorOpen.set(true);
  }

  openEditContactEditor(contact: SupplierContactResponse): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(contact.id);
    this.contactName.set(contact.name || '');
    this.contactDepartment.set(contact.department || 'commercial');
    this.contactRole.set(contact.role || '');
    this.contactEmail.set(contact.email || '');
    this.contactPhone.set(contact.phone || '');
    this.contactExtension.set(contact.extension || '');
    this.contactMobile.set(contact.mobile || '');
    this.contactHasWhatsapp.set(contact.has_whatsapp ?? true);
    this.contactIsPrimary.set(Boolean(contact.is_primary));
    this.contactNotes.set(contact.notes || '');
    this.contactErrors.set({});
    this.contactEditorOpen.set(true);
  }

  resetContactEditor(): void {
    this.contactEditorOpen.set(false);
    this.editingContactId.set(null);
    this.contactName.set('');
    this.contactDepartment.set('commercial');
    this.contactRole.set('');
    this.contactEmail.set('');
    this.contactPhone.set('');
    this.contactExtension.set('');
    this.contactMobile.set('');
    this.contactHasWhatsapp.set(true);
    this.contactIsPrimary.set(false);
    this.contactNotes.set('');
    this.contactErrors.set({});
  }

  onContactPrimaryToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.contactIsPrimary.set(checked);
  }

  onContactWhatsappToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.contactHasWhatsapp.set(checked);
  }

  getContactDeptLabel(dept: string | null | undefined): string {
    return getDepartmentLabel(dept);
  }

  requestOpenContacts(): void {
    const s = this.supplier();
    if (s?.id) {
      this.openContactsRequested.emit(s.id);
    }
  }

  private validateContactForm(): boolean {
    const errs: Record<string, string> = {};
    const name = this.contactName().trim();
    const dept = this.contactDepartment().trim();
    const email = this.contactEmail().trim();

    if (!name) {
      errs['name'] = 'O nome do contato é obrigatório.';
    } else if (name.length > 255) {
      errs['name'] = 'O nome deve ter no máximo 255 caracteres.';
    }

    if (!dept) {
      errs['department'] = 'Selecione o departamento.';
    }

    if (!email) {
      errs['email'] = 'O e-mail do contato é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs['email'] = 'Informe um e-mail válido.';
    }

    this.contactErrors.set(errs);
    return Object.keys(errs).length === 0;
  }

  saveContact(): void {
    if (this.isReadOnly() || !this.validateContactForm()) return;

    const payload: SupplierContactRequest = {
      name: this.contactName().trim(),
      department: this.contactDepartment().trim() || 'commercial',
      role: this.contactRole().trim() || null,
      email: this.contactEmail().trim(),
      phone: this.contactPhone().trim() || null,
      extension: this.contactExtension().trim() || null,
      mobile: this.contactMobile().trim() || null,
      has_whatsapp: this.contactHasWhatsapp(),
      is_primary: this.contactIsPrimary(),
      active: true,
      notes: this.contactNotes().trim() || null,
    };

    const editId = this.editingContactId();

    if (editId) {
      this.contacts.update((list) =>
        list.map((c) => {
          if (c.id === editId) {
            return {
              ...c,
              ...payload,
              role: payload.role ?? null,
              department: payload.department,
              email: payload.email,
              phone: payload.phone ?? null,
              extension: payload.extension ?? null,
              mobile: payload.mobile ?? null,
              has_whatsapp: Boolean(payload.has_whatsapp),
              is_primary: Boolean(payload.is_primary),
              active: true,
              notes: payload.notes ?? null,
            };
          }
          return payload.is_primary ? { ...c, is_primary: false } : c;
        }),
      );
    } else {
      // const tempContact: SupplierContactResponse = {
      //   id: 'tmp-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6),
      //   supplier_id: this.supplier()?.id || '',
      //   name: payload.name,
      //   department: payload.department,
      //   role: payload.role ?? null,
      //   email: payload.email,
      //   phone: payload.phone ?? null,
      //   extension: payload.extension ?? null,
      //   mobile: payload.mobile ?? null,
      //   has_whatsapp: Boolean(payload.has_whatsapp),
      //   is_primary: Boolean(payload.is_primary),
      //   active: true,
      //   notes: payload.notes ?? null,
      // };
      // this.contacts.update((list) => {
      //   const base = tempContact.is_primary ? list.map((c) => ({ ...c, is_primary: false })) : list;
      //   return [...base, tempContact];
      // });
    }

    this.resetContactEditor();
  }

  setPrimaryContact(contact: SupplierContactResponse): void {
    if (this.isReadOnly() || contact.is_primary) return;
    this.contacts.update((list) => list.map((c) => ({ ...c, is_primary: c.id === contact.id })));
  }

  removeContact(contact: SupplierContactResponse): void {
    if (this.isReadOnly()) return;
    this.contacts.update((list) => list.filter((c) => c.id !== contact.id));
  }

  // SupplierResponse Validation & Submission
  validate(): boolean {
    const errors: Record<string, string> = {};
    const corp = this.corporateName().trim();
    const em = this.email().trim();
    const uf = this.state().trim();

    if (!corp) {
      errors['corporate_name'] = 'A razão social é obrigatória.';
    } else if (corp.length > 255) {
      errors['corporate_name'] = 'A razão social deve ter no máximo 255 caracteres.';
    }

    if (this.document().trim().length > 20) {
      errors['document'] = 'O documento (CNPJ/CPF) deve ter no máximo 20 caracteres.';
    }

    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      errors['email'] = 'Informe um endereço de e-mail válido.';
    }

    if (uf && uf.length !== 2) {
      errors['state'] = 'Selecione uma UF válida (2 caracteres).';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (this.isReadOnly()) {
      this.close();
      return;
    }

    if (!this.validate()) {
      this.toastService.warning(
        'Campos inválidos',
        'Por favor, corrija os erros sinalizados no formulário.',
      );
      return;
    }

    this.isSubmitting.set(true);

    // const opt = (val: string): string | null => (val.trim() ? val.trim() : null);

    // if (this.mode() === 'edit' && this.supplier()) {
    //   const payload: SupplierContactRequest = {
    //     corporate_name: this.corporateName().trim(),
    //     trade_name: opt(this.tradeName()),
    //     document: opt(this.document()),
    //     state_registration: opt(this.stateRegistration()),
    //     email: opt(this.email()),
    //     phone: opt(this.phone()),
    //     website: opt(this.website()),
    //     zip_code: opt(this.zipCode()),
    //     street: opt(this.street()),
    //     number: opt(this.number()),
    //     complement: opt(this.complement()),
    //     neighborhood: opt(this.neighborhood()),
    //     city: opt(this.city()),
    //     state: opt(this.state()) ? this.state().trim().toUpperCase() : null,
    //     notes: opt(this.notes()),
    //     status_id: this.statusId() || null,
    //   };

    //   this.supplierService.update(this.supplier()!.id, payload).subscribe({
    //     next: (res) => {
    //       this.isSubmitting.set(false);
    //       this.toastService.success(
    //         'Fornecedor Atualizado',
    //         `"${res.data.trade_name || res.data.corporate_name}" foi atualizado com sucesso.`,
    //       );
    //       this.supplierSaved.emit(res.data);
    //       this.close();
    //     },
    //     error: (err) => {
    //       this.handleApiErrors(err, 'Erro ao atualizar fornecedor');
    //     },
    //   });
    // } else {
    //   const payload: CreateSupplierPayload = {
    //     corporate_name: this.corporateName().trim(),
    //     trade_name: opt(this.tradeName()),
    //     document: opt(this.document()),
    //     state_registration: opt(this.stateRegistration()),
    //     email: opt(this.email()),
    //     phone: opt(this.phone()),
    //     website: opt(this.website()),
    //     zip_code: opt(this.zipCode()),
    //     street: opt(this.street()),
    //     number: opt(this.number()),
    //     complement: opt(this.complement()),
    //     neighborhood: opt(this.neighborhood()),
    //     city: opt(this.city()),
    //     state: opt(this.state()) ? this.state().trim().toUpperCase() : null,
    //     notes: opt(this.notes()),
    //     status_id: this.statusId() || null,
    //     contacts: this.contacts().map((c) => ({
    //       name: c.name,
    //       department: c.department,
    //       role: c.role,
    //       email: c.email,
    //       phone: c.phone,
    //       extension: c.extension,
    //       mobile: c.mobile,
    //       has_whatsapp: c.has_whatsapp,
    //       is_primary: c.is_primary,
    //       active: c.active,
    //       notes: c.notes,
    //     })),
    //   };

    //   this.supplierService.create(payload).subscribe({
    //     next: (res) => {
    //       this.isSubmitting.set(false);
    //       this.toastService.success(
    //         'Fornecedor Cadastrado',
    //         `"${res.data.trade_name || res.data.corporate_name}" foi cadastrado com sucesso.`,
    //       );
    //       this.supplierSaved.emit(res.data);
    //       this.close();
    //     },
    //     error: (err) => {
    //       this.handleApiErrors(err, 'Erro ao cadastrar fornecedor');
    //     },
    //   });
    // }
  }

  private handleApiErrors(
    err: { error?: { errors?: Record<string, unknown>; message?: string }; message?: string },
    title: string,
  ): void {
    this.isSubmitting.set(false);
    if (err.error?.errors) {
      const apiErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(err.error.errors)) {
        apiErrors[key] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
      }
      this.formErrors.set(apiErrors);
    }
    this.toastService.error(
      title,
      err.error?.message || err.message || 'Falha na comunicação com o servidor.',
    );
  }

  close(): void {
    this.closeForm.emit();
  }
}
