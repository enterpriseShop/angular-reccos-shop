import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.html',
  styleUrl: './dialog.css'
})
export class DialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  readonly closeDialog = output<void>();

  close(): void {
    this.closeDialog.emit();
  }

  onBackdropClick(): void {
    this.close();
  }

  get sizeClass(): () => string {
    return () => {
      switch (this.size()) {
        case 'sm': return 'max-w-md';
        case 'lg': return 'max-w-2xl';
        case 'xl': return 'max-w-4xl';
        case 'md': default: return 'max-w-lg';
      }
    };
  }
}
