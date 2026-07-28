import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<'sm' | 'md'>('md');

  get badgeClasses(): () => string {
    return () => {
      const base =
        'inline-flex items-center font-medium leading-none whitespace-nowrap rounded-md tracking-wide';
      const sz = this.size() === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

      let colors = '';
      switch (this.variant()) {
        case 'primary':
          colors =
            'bg-[#EAF4EE] text-[#4F8A6B] dark:bg-[#4F8A6B]/20 dark:text-[#5BAE6A] border border-[#4F8A6B]/30';
          break;
        case 'success':
          colors =
            'bg-emerald-50 text-[#5BAE6A] dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
          break;
        case 'warning':
          colors =
            'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-[#E9B949] border border-amber-200 dark:border-amber-800/50';
          break;
        case 'error':
          colors =
            'bg-rose-50 text-[#D66A6A] dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50';
          break;
        case 'info':
          colors =
            'bg-blue-50 text-[#5A8DEE] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
          break;
        case 'neutral':
          colors =
            'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border border-gray-200 dark:border-slate-700';
          break;
      }

      return `${base} ${sz} ${colors}`;
    };
  }
}
