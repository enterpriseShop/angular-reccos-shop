import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Confirmar Ação');
  readonly message = input<string>('Tem certeza de que deseja realizar esta operação?');
  readonly type = input<'danger' | 'warning' | 'info'>('danger');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');

  readonly confirmAction = output<void>();
  readonly cancelAction = output<void>();

  onConfirm(): void {
    this.confirmAction.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }

  get confirmVariant(): () => 'danger' | 'primary' {
    return () => (this.type() === 'danger' ? 'danger' : 'primary');
  }

  get typeIcon(): () => string {
    return () => {
      switch (this.type()) {
        case 'danger':
          return 'trash-2';
        case 'warning':
          return 'alert-circle';
        case 'info':
        default:
          return 'info';
      }
    };
  }

  get iconBgClass(): () => string {
    return () => {
      switch (this.type()) {
        case 'danger':
          return 'bg-rose-50 dark:bg-rose-950/40 text-[#D66A6A]';
        case 'warning':
          return 'bg-amber-50 dark:bg-amber-950/40 text-[#E9B949]';
        case 'info':
        default:
          return 'bg-blue-50 dark:bg-blue-950/40 text-[#5A8DEE]';
      }
    };
  }
}
