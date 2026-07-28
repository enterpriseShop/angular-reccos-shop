import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, ToastMessage } from '../../core/services/toast';
import { AppIconComponent } from '../icon/app-icon';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'check';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-circle';
      case 'info':
      default:
        return 'info';
    }
  }

  iconColor(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'text-[#5BAE6A]';
      case 'error':
        return 'text-[#D66A6A]';
      case 'warning':
        return 'text-[#E9B949]';
      case 'info':
      default:
        return 'text-[#5A8DEE]';
    }
  }

  toastClasses(type: ToastMessage['type']): string {
    const base = 'bg-white dark:bg-slate-800';
    switch (type) {
      case 'success':
        return `${base} border-emerald-200 dark:border-emerald-800/60`;
      case 'error':
        return `${base} border-rose-200 dark:border-rose-800/60`;
      case 'warning':
        return `${base} border-amber-200 dark:border-amber-800/60`;
      case 'info':
      default:
        return `${base} border-blue-200 dark:border-blue-800/60`;
    }
  }
}
