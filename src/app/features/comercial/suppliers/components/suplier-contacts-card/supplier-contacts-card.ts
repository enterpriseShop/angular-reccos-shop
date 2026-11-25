import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  Edit3,
  ExternalLink,
  LucideAngularModule,
  Mail,
  MessageCircle,
  Phone,
  Power,
  Smartphone,
  Star,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-angular';
import { getDepartmentLabel } from '../../../../../core/models/getDepto.model';
import { SupplierContactResponse } from '../../../../../core/models/supplier-contact/supplier-contact-response.model';
import { supplierResponseInitialData } from '../../../../../utils/supplier-response-initial-data';

function toTelUrl(phone: string | null | undefined): string {
  const digits = (phone || '').replace(/\D+/g, '');
  return digits ? `tel:+55${digits}` : '';
}

function toWhatsAppUrl(mobile: string | null | undefined): string {
  const digits = (mobile || '').replace(/\D+/g, '');
  if (!digits) return '';
  const fullNumber = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${fullNumber}`;
}

function toInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

@Component({
  selector: 'app-supplier-contact-card',
  imports: [LucideAngularModule],
  standalone: true,
  templateUrl: './supplier-contacts-card.html',
  styleUrl: './supplier-contacts-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierContactsCard {
  readonly contact = input<SupplierContactResponse>(supplierResponseInitialData);
  readonly loading = input(false);

  readonly edit = output<SupplierContactResponse>();
  readonly toggleStatus = output<SupplierContactResponse>();
  readonly promote = output<SupplierContactResponse>();
  readonly delete = output<SupplierContactResponse>();

  readonly icons = {
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
    ExternalLink,
  };

  readonly isActive = computed(() => this.contact().active !== false);
  readonly isPrimary = computed(() => this.contact().is_primary);
  readonly showPrimary = computed(() => this.isPrimary() && this.isActive());
  readonly canPromote = computed(() => this.isActive() && !this.isPrimary());
  readonly initials = computed(() => toInitials(this.contact().name));
  readonly departmentLabel = computed(() => getDepartmentLabel(this.contact().department));
  readonly statusActionLabel = computed(() => (this.isActive() ? 'Desativar' : 'Reativar'));
  readonly mailtoHref = computed(() => {
    const email = this.contact().email;
    return email ? `mailto:${email}` : '';
  });
  readonly mobileTelUrl = computed(() => toTelUrl(this.contact().mobile));
  readonly phoneTelUrl = computed(() => toTelUrl(this.contact().phone));
  readonly whatsAppUrl = computed(() => toWhatsAppUrl(this.contact().mobile));
  readonly hasPhoneLine = computed(() => !!this.contact().phone || !!this.contact().extension);
  readonly showPhoneSeparator = computed(
    () => !!this.contact().phone && !!this.contact().extension,
  );

  readonly cardClass = computed(() => {
    if (this.showPrimary()) {
      return 'bg-white dark:bg-slate-800 border-[#4F8A6B]/50 dark:border-[#5BAE6A]/45 shadow-2xs';
    }
    if (!this.isActive()) {
      return 'bg-slate-50/80 dark:bg-slate-800/45 border-gray-200/70 dark:border-slate-700/60 opacity-80';
    }
    return 'bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700/80';
  });

  readonly avatarClass = computed(() => {
    if (!this.isActive()) {
      return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
    if (this.isPrimary()) {
      return 'bg-[#4F8A6B] text-white';
    }
    return 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200';
  });

  readonly statusActionClass = computed(() =>
    this.isActive()
      ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
      : 'text-[#4F8A6B] dark:text-[#5BAE6A] hover:bg-[#EAF4EE] dark:hover:bg-[#4F8A6B]/20',
  );
}
