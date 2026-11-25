import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  Building2,
  Users,
  Globe,
  MapPin,
  Mail,
  Phone,
  Smartphone,
  ExternalLink,
  Star,
  FileText,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  ArrowRight,
} from 'lucide-angular';
import { PageHeaderComponent } from '../../../../../design-system/page-header/page-header';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { ErrorStateComponent } from '../../../../../design-system/error-state/error-state';
import { SupplierContactsComponent } from '../supplier-contacts/supplier-contacts';
import { SupplierFormComponent } from '../supplier-form/supplier-form';
import { SupplierService } from '../../../../../core/services/supplier';
import { ShellStateService } from '../../../../../core/services/shell-state';
import { SupplierResponse } from '../../../../../core/models/suppliers/supplier-response.model';
import { SupplierContactResponse } from '../../../../../core/models/supplier-contact/supplier-contact-response.model';
import { getDepartmentLabel } from '../../../../../core/models/getDepto.model';

export type SupplierDetailsTab = 'overview' | 'contacts';

@Component({
  selector: 'app-supplier-details-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    ButtonComponent,
    ErrorStateComponent,
    SupplierContactsComponent,
    SupplierFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-details.html',
})
export class SupplierDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supplierService = inject(SupplierService);
  private readonly shellState = inject(ShellStateService);

  readonly supplierIdSignal = signal<string>('');
  readonly supplierSignal = signal<SupplierResponse | null>(null);
  readonly loadingSignal = signal<boolean>(true);
  readonly errorSignal = signal<string | null>(null);
  readonly activeTabSignal = signal<SupplierDetailsTab>('overview');
  readonly isEditDrawerOpenSignal = signal<boolean>(false);

  readonly icons = {
    Building2,
    Users,
    Globe,
    MapPin,
    Mail,
    Phone,
    Smartphone,
    ExternalLink,
    Star,
    FileText,
    ArrowLeft,
    Edit3,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MessageCircle,
    ArrowRight,
  };

  readonly displayName = computed(() => {
    const s = this.supplierSignal();
    if (!s) return 'Detalhes do Fornecedor';
    return s.trade_name || s.corporate_name;
  });

  readonly pageTitle = computed(() => {
    const s = this.supplierSignal();
    if (!s) return 'Detalhes do Fornecedor';
    return `Fornecedor: ${s.trade_name || s.corporate_name}`;
  });

  readonly pageSubtitle = computed(() => {
    const s = this.supplierSignal();
    if (!s) return 'Visão detalhada e gerenciamento estratégico de contatos do fornecedor.';
    const parts: string[] = [s.corporate_name];
    if (s.document) parts.push(s.document);
    if (s.city && s.state) parts.push(`${s.city}/${s.state}`);
    return parts.join(' · ');
  });

  readonly breadcrumbs = computed(() => [
    { label: 'Comercial', route: '/commercial/suppliers' },
    { label: 'Fornecedores', route: '/commercial/suppliers' },
    { label: this.displayName() },
  ]);

  readonly isSupplierActive = computed(() => {
    const s = this.supplierSignal();
    if (!s) return true;
    // const code = (s.status?.code || '').toLowerCase();
    // return s.active ?? code === 'active';
    return true;
  });

  readonly statusLabel = computed(() => {
    const s = this.supplierSignal();
    if (!s) return 'Ativo';
    return s.status?.name || (this.isSupplierActive() ? 'Ativo' : 'Inativo');
  });

  readonly contactsCount = computed(() => {
    const s = this.supplierSignal();
    if (!s) return 0;
    // return s.contacts_count ?? (s.contacts ? s.contacts.length : 0);
    return 0;
  });

  readonly activeContactsCount = computed(() => {
    const s = this.supplierSignal();
    if (!s || !s.contacts) return 0;
    return s.contacts.filter((c) => c.active !== false).length;
  });

  readonly primaryContact = computed<SupplierContactResponse | null>(() => {
    const s = this.supplierSignal();
    if (!s || !s.contacts || s.contacts.length === 0) return null;
    return (
      s.contacts.find((c) => c.is_primary && c.active !== false) ||
      s.contacts.find((c) => c.active !== false) ||
      null
    );
  });

  readonly formattedAddress = computed(() => {
    const s = this.supplierSignal();
    if (!s) return '';
    const line1 = [s.street, s.number].filter(Boolean).join(', ');
    const line2 = [s.complement, s.neighborhood].filter(Boolean).join(' · ');
    const line3 = [s.city && s.state ? `${s.city}/${s.state}` : s.city || s.state, s.zip_code]
      .filter(Boolean)
      .join(' — CEP ');
    return [line1, line2, line3].filter(Boolean).join('\n');
  });

  ngOnInit(): void {
    this.shellState.setActiveRoute('/commercial/suppliers');

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') || '';
      if (id && id !== this.supplierIdSignal()) {
        this.supplierIdSignal.set(id);
        this.loadSupplier(id);
      }
    });

    this.route.queryParamMap.subscribe((query) => {
      const tab = query.get('tab');
      if (tab === 'contacts') {
        this.activeTabSignal.set('contacts');
      } else if (tab === 'overview') {
        this.activeTabSignal.set('overview');
      }
    });
  }

  loadSupplier(id: string = this.supplierIdSignal(), silent = false): void {
    if (!id) return;
    if (!silent) {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
    }

    this.supplierService.getById(id).subscribe({
      next: (res) => {
        this.supplierSignal.set(res.data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.loadingSignal.set(false);
        if (!silent) {
          this.errorSignal.set(
            err.error?.message || err.message || 'Fornecedor não encontrado ou indisponível.',
          );
        }
      },
    });
  }

  setActiveTab(tab: SupplierDetailsTab): void {
    this.activeTabSignal.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'contacts' ? 'contacts' : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  goBack(): void {
    this.router.navigate(['/commercial/suppliers']);
  }

  openEditDrawer(): void {
    this.isEditDrawerOpenSignal.set(true);
  }

  closeEditDrawer(): void {
    this.isEditDrawerOpenSignal.set(false);
  }

  onSupplierUpdated(updated: SupplierResponse): void {
    this.supplierSignal.set(updated);
    this.loadSupplier(updated.id, true);
  }

  onContactsChanged(): void {
    this.loadSupplier(this.supplierIdSignal(), true);
  }

  getDeptLabel(dept: string | null | undefined): string {
    return getDepartmentLabel(dept);
  }

  getWhatsAppUrl(mobile: string | null | undefined): string {
    const digits = (mobile || '').replace(/\D+/g, '');
    if (!digits) return '';
    const fullNumber = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
    return `https://wa.me/${fullNumber}`;
  }
}
