import { Component, ChangeDetectionStrategy, input, signal, ElementRef, inject, HostListener } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  divider?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css'
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);

  readonly items = input<DropdownItem[]>([]);
  readonly align = input<'left' | 'right'>('right');

  readonly isOpen = signal<boolean>(false);

  toggleOpen(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(o => !o);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onSelect(item: DropdownItem, event: MouseEvent): void {
    event.stopPropagation();
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  get alignClasses(): () => string {
    return () => {
      return this.align() === 'left' ? 'left-0' : 'right-0';
    };
  }
}
