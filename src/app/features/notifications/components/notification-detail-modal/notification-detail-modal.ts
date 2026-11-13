import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationMockService } from '../../../../core/utils/notification-mock';
import { DialogComponent } from '../../../../design-system/dialog/dialog';
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { BadgeComponent } from '../../../../design-system/badge/badge';
import { NotificationDisplayResponse } from '../../../../core/models/notification/notification-display-response.model';
import { DatePipe } from '@angular/common';

const TYPE_ICON_MAP: Record<string, string> = {
  warning: 'alert-triangle',
  success: 'check-circle',
  error: 'alert-circle',
  system: 'cpu',
  info: 'info',
};

const TYPE_BADGE_VARIANT_MAP: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral'> =
  {
    warning: 'warning',
    success: 'success',
    error: 'error',
    info: 'info',
  };

const CATEGORY_LABEL_MAP: Record<string, string> = {
  estoque: 'Estoque',
  importacao: 'Importação',
  catalogo: 'Catálogo',
  compatibilidade: 'Compatibilidade OEM',
  veiculos: 'Veículos',
  sistema: 'Sistema',
};

const PRIORITY_LABEL_MAP: Record<string, string> = {
  alta: 'Alta Prioridade',
  media: 'Prioridade Média',
  baixa: 'Baixa Prioridade',
};

@Component({
  selector: 'app-notification-detail-modal',
  standalone: true,
  imports: [
    DialogComponent,
    ButtonComponent,
    AppIconComponent,
    BadgeComponent,
    DatePipe,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-detail-modal.html',
})
export class NotificationDetailModalComponent {
  private readonly router = inject(Router);
  readonly notificationMockService = inject(NotificationMockService);

  readonly isOpen = input<boolean>(false);
  readonly notification = input<NotificationDisplayResponse | null>(null);

  readonly closeModal = output<void>();
  readonly deleteRequested = output<NotificationDisplayResponse>();

  readonly typeIcon = computed(() => {
    const item = this.notification();
    return item ? (TYPE_ICON_MAP[item.type] ?? 'info') : 'info';
  });

  readonly typeBadgeVariant = computed(() => {
    const item = this.notification();
    return item ? (TYPE_BADGE_VARIANT_MAP[item.type] ?? 'info') : 'info';
  });

  readonly categoryLabel = computed(() => {
    const item = this.notification();
    return item ? (CATEGORY_LABEL_MAP[item.type] ?? 'Geral') : 'Geral';
  });

  readonly priorityLabel = computed(() => {
    const item = this.notification();
    return item ? (PRIORITY_LABEL_MAP[item.message] ?? 'Normal') : 'Normal';
  });

  toggleRead(): void {
    const item = this.notification();
    if (item) {
      this.notificationMockService.toggleReadStatus(item.id);
    }
  }

  navigateToReference(): void {
    const item = this.notification();
    if (item?.reference?.route) {
      this.closeModal.emit();
      this.router.navigateByUrl(item.reference.route);
    }
  }

  requestDelete(): void {
    const item = this.notification();
    if (item) {
      this.deleteRequested.emit(item);
    }
  }
}
