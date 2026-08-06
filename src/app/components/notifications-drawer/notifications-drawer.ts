import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DrawerComponent } from '../../design-system/drawer/drawer';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { ButtonComponent } from '../../design-system/button/button';
import { ShellStateService } from '../../core/services/shell-state';

@Component({
  selector: 'app-notifications-drawer',
  standalone: true,
  imports: [DrawerComponent, AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-drawer.html',
  styleUrl: './notifications-drawer.css',
})
export class NotificationsDrawerComponent {
  readonly shellState = inject(ShellStateService);

  getIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'alert-circle';
      case 'success':
        return 'check';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'info';
    }
  }

  getBadgeBg(type: string): string {
    switch (type) {
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/60 text-[#E9B949]';
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-[#5BAE6A]';
      case 'error':
        return 'bg-rose-100 dark:bg-rose-950/60 text-[#D66A6A]';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-950/60 text-[#5A8DEE]';
    }
  }
}
