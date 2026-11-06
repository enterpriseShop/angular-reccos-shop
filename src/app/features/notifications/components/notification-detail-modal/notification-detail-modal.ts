import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../../../../core/models/notification-mock.model';
import { NotificationMockService } from '../../../../core/utils/notification-mock';
import { DialogComponent } from '../../../../design-system/dialog/dialog';
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { BadgeComponent } from '../../../../design-system/badge/badge';

const TYPE_ICON_MAP: Record<string, string> = {
  warning: 'alert-triangle',
  success: 'check-circle',
  error: 'alert-circle',
  system: 'cpu',
  info: 'info',
};

const TYPE_BADGE_VARIANT_MAP: Record<string, 'warning' | 'success' | 'error' | 'info' | 'neutral'> = {
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
  imports: [DialogComponent, ButtonComponent, AppIconComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-detail-modal.html',
})
export class NotificationDetailModalComponent {
  readonly notification = input<AppNotification | null>(null);
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly deleteRequested = output<string>();

  readonly notificationMockService = inject(NotificationMockService);
  private readonly router = inject(Router);

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
    return item ? (CATEGORY_LABEL_MAP[item.category] ?? 'Geral') : 'Geral';
  });

  readonly priorityLabel = computed(() => {
    const item = this.notification();
    return item ? (PRIORITY_LABEL_MAP[item.priority] ?? 'Normal') : 'Normal';
  });

  toggleRead(): void {
    const item = this.notification();
    if (item) {
      this.notificationMockService.toggleReadStatus(item.id);
    }
  }

  navigateToRelated(): void {
    const item = this.notification();
    if (item?.relatedEntity?.route) {
      this.closeModal.emit();
      this.router.navigateByUrl(item.relatedEntity.route);
    } else if (item?.link) {
      this.closeModal.emit();
      this.router.navigateByUrl(item.link);
    }
  }

  requestDelete(): void {
    const item = this.notification();
    if (item) {
      this.deleteRequested.emit(item.id);
    }
  }
}
