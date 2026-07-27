import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drawer.html',
  styleUrl: './drawer.css'
})
export class DrawerComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly icon = input<string | undefined>(undefined);
  readonly width = input<'sm' | 'md' | 'lg'>('md');

  readonly closeDrawer = output<void>();

  close(): void {
    this.closeDrawer.emit();
  }

  onBackdropClick(): void {
    this.close();
  }

  get widthClass(): () => string {
    return () => {
      switch (this.width()) {
        case 'sm': return 'max-w-sm';
        case 'lg': return 'max-w-xl';
        case 'md': default: return 'max-w-md';
      }
    };
  }
}
