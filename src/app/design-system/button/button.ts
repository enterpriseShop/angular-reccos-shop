import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

import { AppIconComponent } from '../icon/app-icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type IconSize =
  | 'xxs'
  | 'xs'
  | 'sm'
  | '1x'
  | 'lg'
  | 'xl'
  | '2x'
  | '3x'
  | '4x'
  | '5x'
  | '6x'
  | '7x'
  | '8x'
  | '9x'
  | '10x';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly iconSize = input<IconSize>('1x');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly iconStart = input<string | undefined>(undefined);
  readonly iconEnd = input<string | undefined>(undefined);
  readonly iconVariant = input<'line' | 'fill'>('line');
  readonly fullWidth = input<boolean>(false);
  readonly btnClick = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

    // Tailwind CSS standard sizes
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-8',
      md: 'px-4 py-2 text-sm gap-2 min-h-10',
      lg: 'px-6 py-3 text-base gap-2 min-h-12',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[#4F8A6B] hover:bg-[#43765C] text-white shadow-sm focus-visible:ring-[#4F8A6B] active:bg-[#38624C]',

      secondary:
        'bg-[#EAF4EE] hover:bg-[#d8eadd] text-[#4F8A6B] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-[#5BAE6A]',

      outline:
        'border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700',

      ghost: 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800',

      danger: 'bg-[#D66A6A] hover:bg-[#c05959] text-white shadow-sm focus-visible:ring-[#D66A6A]',
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return [base, sizeClasses[this.size()], variantClasses[this.variant()], width]
      .filter(Boolean)
      .join(' ');
  });

  readonly iconClasses = computed(() => `ri-${this.iconSize()}`);

  readonly iconStartName = computed(() =>
    this.iconStart() ? `ri-${this.iconStart()}` : undefined,
  );

  readonly iconEndName = computed(() => (this.iconEnd() ? `ri-${this.iconEnd()}` : undefined));

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit(event);
    }
  }
}
