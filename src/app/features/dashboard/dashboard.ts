import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PageHeaderComponent } from '../../design-system/page-header/page-header';
import { ButtonComponent } from '../../design-system/button/button';
import { BadgeComponent } from '../../design-system/badge/badge';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { ToastService } from '../../core/services/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [PageHeaderComponent, ButtonComponent, BadgeComponent, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPageComponent {
  private toastService = inject(ToastService);
  private router = inject(Router);

  refreshStats(): void {
    this.toastService.success(
      'Dados Atualizados',
      'Sincronização com a base do catálogo concluída.',
    );
  }

  navTo(route: string): void {
    this.router.navigate([route]);
  }
}
