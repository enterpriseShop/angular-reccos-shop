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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Briefcase,
  Mail,
  Phone,
  Smartphone,
  MessageCircle,
  Star,
  AlertCircle,
  Check,
  Building2,
} from 'lucide-angular';
import { DialogComponent } from '../../../../../design-system/dialog/dialog';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { ToastService } from '../../../../../core/services/toast';
import { SupplierContactResponse } from '../../../../../core/models/supplier-contact/supplier-contact-response.model';
import { SUPPLIER_CONTACT_DEPARTMENTS } from '../../../../../utils/supplier-contact-depto';
import { SupplierContactService } from '../../../../../core/services/supplier-contact';
import { SupplierContactRequest } from '../../../../../core/models/supplier-contact/supplier-contact-request.model';

@Component({
  selector: 'app-supplier-contact-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    DialogComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-contact-modal.html',
})
export class SupplierContactModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supplierContactService = inject(SupplierContactService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly supplierId = input.required<string>();
  readonly supplierName = input<string>('');
  readonly contact = input<SupplierContactResponse | null>(null);
  readonly defaultPrimary = input<boolean>(false);

  readonly closeModal = output<void>();
  readonly saved = output<SupplierContactResponse>();

  readonly departments = SUPPLIER_CONTACT_DEPARTMENTS;

  readonly isSavingSignal = signal<boolean>(false);
  readonly serverErrorsSignal = signal<Record<string, string>>({});

  // Lucide Icons
  readonly icons = {
    User,
    Briefcase,
    Mail,
    Phone,
    Smartphone,
    MessageCircle,
    Star,
    AlertCircle,
    Check,
    Building2,
  };

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    department: ['commercial', [Validators.required]],
    role: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    mobile: ['', [Validators.maxLength(30)]],
    has_whatsapp: [true],
    phone: ['', [Validators.maxLength(30)]],
    extension: ['', [Validators.maxLength(20)]],
    notes: ['', [Validators.maxLength(1000)]],
    is_primary: [false],
    active: [true],
  });

  readonly isEditing = computed(() => this.contact() !== null);

  readonly modalTitle = computed(() =>
    this.isEditing() ? 'Editar Contato do Fornecedor' : 'Adicionar Contato',
  );

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const current = this.contact();
      const defPrimary = this.defaultPrimary();

      if (open) {
        this.serverErrorsSignal.set({});
        this.isSavingSignal.set(false);

        if (current) {
          this.form.reset({
            name: current.name || '',
            department: current.department || 'commercial',
            role: current.role || '',
            email: current.email || '',
            mobile: current.mobile || '',
            has_whatsapp: current.has_whatsapp ?? true,
            phone: current.phone || '',
            extension: current.extension || '',
            notes: current.notes || '',
            is_primary: Boolean(current.is_primary),
            active: current.active !== undefined ? Boolean(current.active) : true,
          });
          if (!current.active) {
            this.form.controls.is_primary.disable({ emitEvent: false });
          } else {
            this.form.controls.is_primary.enable({ emitEvent: false });
          }
        } else {
          this.form.reset({
            name: '',
            department: 'commercial',
            role: '',
            email: '',
            mobile: '',
            has_whatsapp: true,
            phone: '',
            extension: '',
            notes: '',
            is_primary: defPrimary,
            active: true,
          });
          this.form.controls.is_primary.enable({ emitEvent: false });
        }
      }
    });

    this.form.controls.active.valueChanges.subscribe((isActive) => {
      if (!isActive) {
        this.form.controls.is_primary.setValue(false, { emitEvent: false });
        this.form.controls.is_primary.disable({ emitEvent: false });
      } else {
        this.form.controls.is_primary.enable({ emitEvent: false });
      }
    });
  }

  onPhoneInput(controlName: 'phone' | 'mobile', event: Event): void {
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
    this.form.controls[controlName].setValue(formatted);
    this.clearServerError(controlName);
  }

  clearServerError(field: string): void {
    this.serverErrorsSignal.update((errs) => {
      if (!errs[field]) return errs;
      const copy = { ...errs };
      delete copy[field];
      return copy;
    });
  }

  getFieldError(field: keyof typeof this.form.controls): string | null {
    const serverErr = this.serverErrorsSignal()[field];
    if (serverErr) return serverErr;

    const control = this.form.controls[field];
    if (!control.touched && !control.dirty) return null;
    if (!control.errors) return null;

    if (control.errors['required']) {
      if (field === 'name') return 'O nome completo do contato é obrigatório.';
      if (field === 'department') return 'Selecione o departamento do contato.';
      if (field === 'email') return 'O e-mail corporativo é obrigatório.';
      return 'Campo obrigatório.';
    }
    if (control.errors['email']) {
      return 'Informe um endereço de e-mail válido.';
    }
    if (control.errors['maxlength']) {
      return 'Limite de caracteres excedido.';
    }
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSavingSignal()) {
      if (this.form.invalid) {
        this.toastService.warning(
          'Campos obrigatórios',
          'Verifique os campos destacados antes de salvar o contato.',
        );
      }
      return;
    }

    const raw = this.form.getRawValue();
    const opt = (val: string): string | null => (val.trim() ? val.trim() : null);

    const payload: SupplierContactRequest = {
      name: raw.name.trim(),
      department: raw.department,
      role: opt(raw.role),
      email: raw.email.trim(),
      phone: opt(raw.phone),
      extension: opt(raw.extension),
      mobile: opt(raw.mobile),
      has_whatsapp: Boolean(raw.has_whatsapp),
      is_primary: raw.active ? Boolean(raw.is_primary) : false,
      active: Boolean(raw.active),
      notes: opt(raw.notes),
    };

    this.isSavingSignal.set(true);
    const current = this.contact();
    const supId = this.supplierId();

    const request$ = current
      ? this.supplierContactService.update(supId, current.id, payload)
      : this.supplierContactService.create(supId, payload);

    request$.subscribe({
      next: (res) => {
        this.isSavingSignal.set(false);
        const savedContact = res.data;
        this.toastService.success(
          current ? 'Contato atualizado' : 'Contato cadastrado',
          current
            ? `Os dados de ${savedContact.name} foram atualizados.`
            : `${savedContact.name} foi vinculado ao fornecedor.`,
        );
        this.saved.emit(savedContact);
        this.close();
      },
      error: (err) => {
        this.isSavingSignal.set(false);
        if (err.error?.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.error.errors)) {
            mapped[key] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
          }
          this.serverErrorsSignal.set(mapped);
        }
        this.toastService.error(
          'Erro ao salvar contato',
          err.error?.message || err.message || 'Não foi possível salvar os dados do contato.',
        );
      },
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
