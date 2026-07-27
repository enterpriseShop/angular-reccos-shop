import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly iconStart = input<string | undefined>(undefined);
  readonly iconEnd = input<string | undefined>(undefined);
  readonly fullWidth = input<boolean>(false);

  readonly btnClick = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit(event);
    }
  }

  get buttonClasses(): () => string {
    return () => {
      const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[8px]';
      const width = this.fullWidth() ? 'w-full' : '';

      let sz = 'px-4 py-2 text-sm';
      if (this.size() === 'sm') sz = 'px-3 py-1.5 text-xs';
      if (this.size() === 'lg') sz = 'px-5 py-2.5 text-base';

      let varClass = '';
      switch (this.variant()) {
        case 'primary':
          varClass = 'bg-[#4F8A6B] hover:bg-[#43765C] text-white shadow-sm focus:ring-[#4F8A6B] active:bg-[#38624C]';
          break;
        case 'secondary':
          varClass = 'bg-[#EAF4EE] hover:bg-[#d8eadd] text-[#4F8A6B] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-[#5BAE6A]';
          break;
        case 'outline':
          varClass = 'border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700';
          break;
        case 'ghost':
          varClass = 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800';
          break;
        case 'danger':
          varClass = 'bg-[#D66A6A] hover:bg-[#c05959] text-white shadow-sm focus:ring-[#D66A6A]';
          break;
      }

      return `${base} ${sz} ${varClass} ${width}`;
    };
  }
}
