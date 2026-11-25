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
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { DrawerComponent } from '../../../../design-system/drawer/drawer';
import { SupplierService } from '../../../../core/services/supplier';
import { ToastService } from '../../../../core/services/toast';
import { brazilianStates } from '../../../../utils/barzilian-states';
import { IBrazilianState } from '../../../../core/models/generals/brazilian-states.model';
import { SupplierResponse } from '../../../../core/models/suppliers/supplier-response.model';
import { SupplierRequest } from '../../../../core/models/suppliers/supplier-request.model';
import { SUPPLIER_CONTACT_DEPARTMENTS } from '../../../../utils/supplier-contact-depto';
import { SupplierContactResponse } from '../../../../core/models/supplier-contact/supplier-contact-response.model';
import { SupplierContactRequest } from '../../../../core/models/supplier-contact/supplier-contact-request.model';
import { getDepartmentLabel } from '../../../../core/models/getDepto.model';
import { StatusStore } from '../../../../core/store/status-store/status-store';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';

export const BRAZILIAN_STATES: readonly IBrazilianState[] = brazilianStates;

function optionalUf(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return value.length === 2 ? null : { uf: true };
}

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.css',
})
export class SupplierFormComponent {
  private supplierService = inject(SupplierService);
  private statusStore = inject(StatusStore);
  private toastService = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly supplier = input<SupplierResponse | null>(null);
  readonly statusOptions = computed<SelectOption[]>(() => {
    return this.statusStore.optionList().filter((m) => m.module === 'SUPPLIER');
  });

  readonly closeForm = output<void>();
  readonly supplierSaved = output<SupplierResponse>();
  readonly contactsUpdated = output<void>();
  readonly openContactsRequested = output<string>();

  readonly states = BRAZILIAN_STATES;
  readonly contactDepartments = SUPPLIER_CONTACT_DEPARTMENTS;

  readonly isSubmitting = signal<boolean>(false);

  readonly contacts = signal<SupplierContactResponse[]>([]);
  readonly contactEditorOpen = signal<boolean>(false);
  readonly editingContactId = signal<string | null>(null);

  readonly form = this.fb.group({
    corporate_name: ['', [Validators.required, Validators.maxLength(255)]],
    trade_name: ['', [Validators.maxLength(255)]],
    document: ['', [Validators.maxLength(20)]],
    state_registration: ['', [Validators.maxLength(30)]],
    status_id: [''],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(30)]],
    website: ['', [Validators.maxLength(255)]],
    zip_code: ['', [Validators.maxLength(15)]],
    street: ['', [Validators.maxLength(255)]],
    number: ['', [Validators.maxLength(30)]],
    complement: ['', [Validators.maxLength(100)]],
    neighborhood: ['', [Validators.maxLength(100)]],
    city: ['', [Validators.maxLength(100)]],
    state: ['', [optionalUf]],
    notes: [''],
  });

  readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    department: ['commercial', [Validators.required]],
    role: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(30)]],
    extension: ['', [Validators.maxLength(20)]],
    mobile: ['', [Validators.maxLength(30)]],
    has_whatsapp: [true],
    is_primary: [false],
    notes: [''],
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const current = this.supplier();
      const currentMode = this.mode();

      if (!open) return;

      this.resetContactEditor();

      if ((currentMode === 'edit' || currentMode === 'view') && current) {
        this.populateFromSupplier(current);
        this.supplierService.getById(current.id).subscribe({
          next: (res) => {
            if (res.data && this.isOpen() && this.supplier()?.id === current.id) {
              this.populateFromSupplier(res.data);
              this.syncReadOnly();
            }
          },
        });
      } else {
        this.resetSupplierFields();
        this.contactEditorOpen.set(true);
        this.contactForm.reset({
          name: '',
          department: 'commercial',
          role: '',
          email: '',
          phone: '',
          extension: '',
          mobile: '',
          has_whatsapp: true,
          is_primary: true,
          notes: '',
        });
      }

      this.syncReadOnly();
    });
  }

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Fornecedor';
      case 'view':
        return 'Detalhes do Fornecedor';
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
    const statusId = this.formValue().status_id;
    return this.statusOptions().find((status) => status.value === statusId);
  });

  readonly isActive = computed(() => {
    const status = this.currentStatus();
    if (!status) return true;
    return (status.label || '').toLowerCase() === 'active';
  });

  readonly displayHeaderName = computed(() => {
    const value = this.formValue();
    return value.trade_name?.trim() || value.corporate_name?.trim() || 'Novo Fornecedor Homologado';
  });

  readonly displayHeaderSubtitle = computed(() => {
    const value = this.formValue();
    const document = value.document?.trim() ?? '';
    const corporateName = value.corporate_name?.trim() ?? '';
    if (value.trade_name?.trim() && corporateName) {
      return document ? `${corporateName} • ${document}` : corporateName;
    }
    return document || 'CNPJ / CPF NÃO INFORMADO';
  });

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty || !!control.errors?.['api']);
  }

  controlError(
    control: AbstractControl,
    messages: { required?: string; email?: string; maxlength?: string; uf?: string } = {},
  ): string {
    const errors = control.errors;
    if (!errors) return '';
    if (errors['api']) return String(errors['api']);
    if (errors['required']) return messages.required ?? 'Campo obrigatório.';
    if (errors['email']) return messages.email ?? 'Informe um e-mail válido.';
    if (errors['maxlength']) {
      const max = errors['maxlength'].requiredLength;
      return messages.maxlength ?? `Máximo de ${max} caracteres.`;
    }
    if (errors['uf']) return messages.uf ?? 'Selecione uma UF válida (2 caracteres).';
    return 'Valor inválido.';
  }

  onDocumentInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 14);
    let formatted = digits;

    if (digits.length > 11) {
      formatted = digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else if (digits.length > 3) {
      formatted = digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
    }

    this.form.controls.document.setValue(formatted);
  }

  onZipCodeInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    this.form.controls.zip_code.setValue(formatted);
  }

  onPhoneInput(control: FormControl<string>, event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;

    if (digits.length >= 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    } else if (digits.length >= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    control.setValue(formatted);
  }

  selectStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.form.controls.status_id.setValue(id);
    this.form.controls.status_id.markAsDirty();
  }

  openNewContactEditor(): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(null);
    this.contactForm.reset({
      name: '',
      department: 'commercial',
      role: '',
      email: '',
      phone: '',
      extension: '',
      mobile: '',
      has_whatsapp: true,
      is_primary: this.contacts().length === 0,
      notes: '',
    });
    this.contactEditorOpen.set(true);
  }

  openEditContactEditor(contact: SupplierContactResponse): void {
    if (this.isReadOnly()) return;
    this.editingContactId.set(contact.id);
    this.contactForm.reset({
      name: contact.name || '',
      department: contact.department || 'commercial',
      role: contact.role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      extension: contact.extension || '',
      mobile: contact.mobile || '',
      has_whatsapp: contact.has_whatsapp ?? true,
      is_primary: Boolean(contact.is_primary),
      notes: contact.notes || '',
    });
    this.contactEditorOpen.set(true);
  }

  resetContactEditor(): void {
    this.contactEditorOpen.set(false);
    this.editingContactId.set(null);
    this.contactForm.reset({
      name: '',
      department: 'commercial',
      role: '',
      email: '',
      phone: '',
      extension: '',
      mobile: '',
      has_whatsapp: true,
      is_primary: false,
      notes: '',
    });
  }

  getContactDeptLabel(dept: string | null | undefined): string {
    return getDepartmentLabel(dept);
  }

  requestOpenContacts(): void {
    const current = this.supplier();
    if (current?.id) {
      this.openContactsRequested.emit(current.id);
    }
  }

  saveContact(): void {
    if (this.isReadOnly()) return;
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const raw = this.contactForm.getRawValue();
    const payload: SupplierContactRequest = {
      name: raw.name.trim(),
      department: raw.department.trim() || 'commercial',
      role: raw.role.trim() || null,
      email: raw.email.trim(),
      phone: raw.phone.trim() || null,
      extension: raw.extension.trim() || null,
      mobile: raw.mobile.trim() || null,
      has_whatsapp: raw.has_whatsapp,
      is_primary: raw.is_primary,
      active: true,
      notes: raw.notes.trim() || null,
    };

    const editId = this.editingContactId();

    if (editId) {
      this.contacts.update((list) =>
        list.map((contact) => {
          if (contact.id === editId) {
            return {
              ...contact,
              ...payload,
              role: payload.role ?? null,
              phone: payload.phone ?? null,
              extension: payload.extension ?? null,
              mobile: payload.mobile ?? null,
              notes: payload.notes ?? null,
            };
          }
          return payload.is_primary ? { ...contact, is_primary: false } : contact;
        }),
      );
    } else {
      const tempContact: SupplierContactResponse = {
        id: 'tmp-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6),
        supplier_id: this.supplier()?.id || '',
        name: payload.name,
        department: payload.department,
        role: payload.role ?? null,
        email: payload.email,
        phone: payload.phone ?? null,
        extension: payload.extension ?? null,
        mobile: payload.mobile ?? null,
        has_whatsapp: Boolean(payload.has_whatsapp),
        is_primary: Boolean(payload.is_primary),
        active: true,
        notes: payload.notes ?? null,
        created_at: null,
        updated_at: null,
      };
      this.contacts.update((list) => {
        const base = tempContact.is_primary
          ? list.map((contact) => ({ ...contact, is_primary: false }))
          : list;
        return [...base, tempContact];
      });
    }

    this.resetContactEditor();
  }

  setPrimaryContact(contact: SupplierContactResponse): void {
    if (this.isReadOnly() || contact.is_primary) return;
    this.contacts.update((list) =>
      list.map((item) => ({ ...item, is_primary: item.id === contact.id })),
    );
  }

  removeContact(contact: SupplierContactResponse): void {
    if (this.isReadOnly()) return;
    this.contacts.update((list) => list.filter((item) => item.id !== contact.id));
  }

  onSubmit(): void {
    if (this.isReadOnly()) {
      this.close();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning(
        'Campos inválidos',
        'Por favor, corrija os erros sinalizados no formulário.',
      );
      return;
    }

    if (!this.commitPendingContact()) return;

    const payload = this.buildPayload();
    const current = this.supplier();
    this.isSubmitting.set(true);

    const request =
      this.mode() === 'edit' && current
        ? this.supplierService.update(current.id, payload)
        : this.supplierService.create(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const saved = res.data;
        const label = saved.trade_name || saved.corporate_name;
        this.toastService.success(
          this.mode() === 'edit' ? 'Fornecedor Atualizado' : 'Fornecedor Cadastrado',
          `"${label}" foi ${this.mode() === 'edit' ? 'atualizado' : 'cadastrado'} com sucesso.`,
        );
        this.supplierSaved.emit(saved);
        this.close();
      },
      error: (err) => {
        this.handleApiErrors(
          err,
          this.mode() === 'edit' ? 'Erro ao atualizar fornecedor' : 'Erro ao cadastrar fornecedor',
        );
      },
    });
  }

  close(): void {
    this.closeForm.emit();
  }

  private commitPendingContact(): boolean {
    if (!this.contactEditorOpen()) return true;

    const raw = this.contactForm.getRawValue();
    const hasContent = [raw.name, raw.email, raw.role, raw.phone, raw.mobile, raw.notes].some(
      (value) => value.trim().length > 0,
    );

    if (!hasContent) {
      this.resetContactEditor();
      return true;
    }

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toastService.warning(
        'Contato incompleto',
        'Corrija os dados do contato antes de salvar o fornecedor.',
      );
      return false;
    }

    this.saveContact();
    return true;
  }

  private buildPayload(): SupplierRequest {
    const raw = this.form.getRawValue();
    const optional = (value: string): string | null => {
      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    };

    return {
      corporate_name: raw.corporate_name.trim(),
      trade_name: optional(raw.trade_name),
      document: optional(raw.document),
      state_registration: optional(raw.state_registration),
      email: optional(raw.email),
      phone: optional(raw.phone),
      website: optional(raw.website),
      zip_code: optional(raw.zip_code),
      street: optional(raw.street),
      number: optional(raw.number),
      complement: optional(raw.complement),
      neighborhood: optional(raw.neighborhood),
      city: optional(raw.city),
      state: optional(raw.state)?.toUpperCase() ?? null,
      notes: optional(raw.notes),
      status_id: raw.status_id || null,
      contacts: this.contacts().map((contact) => ({
        name: contact.name,
        department: contact.department,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        extension: contact.extension,
        mobile: contact.mobile,
        has_whatsapp: contact.has_whatsapp,
        is_primary: contact.is_primary,
        active: contact.active,
        notes: contact.notes,
      })),
    };
  }

  private populateFromSupplier(supplier: SupplierResponse): void {
    this.form.reset({
      corporate_name: supplier.corporate_name || '',
      trade_name: supplier.trade_name || '',
      document: supplier.document || '',
      state_registration: supplier.state_registration || '',
      status_id: supplier.status?.id || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      website: supplier.website || '',
      zip_code: supplier.zip_code || '',
      street: supplier.street || '',
      number: supplier.number || '',
      complement: supplier.complement || '',
      neighborhood: supplier.neighborhood || '',
      city: supplier.city || '',
      state: supplier.state || '',
      notes: supplier.notes || '',
    });
    this.contacts.set((supplier.contacts || []).map((contact) => ({ ...contact })));
  }

  private resetSupplierFields(): void {
    this.form.reset({
      corporate_name: '',
      trade_name: '',
      document: '',
      state_registration: '',
      status_id: '',
      email: '',
      phone: '',
      website: '',
      zip_code: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      notes: '',
    });
    this.contacts.set([]);
  }

  private syncReadOnly(): void {
    if (this.isReadOnly()) {
      this.form.disable({ emitEvent: false });
      return;
    }
    if (this.form.disabled) {
      this.form.enable({ emitEvent: false });
    }
  }

  private handleApiErrors(
    err: { error?: { errors?: Record<string, unknown>; message?: string }; message?: string },
    title: string,
  ): void {
    this.isSubmitting.set(false);
    if (err.error?.errors) {
      for (const [key, msgs] of Object.entries(err.error.errors)) {
        const control = this.form.get(key);
        const message = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
        if (control) {
          control.setErrors({ api: message });
          control.markAsTouched();
        }
      }
    }
    this.toastService.error(
      title,
      err.error?.message || err.message || 'Falha na comunicação com o servidor.',
    );
  }
}
