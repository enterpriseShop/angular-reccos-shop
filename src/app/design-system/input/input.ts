import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class InputComponent {
  readonly label = input<string | undefined>(undefined);
  readonly type = input<string>('text');
  readonly value = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  readonly iconPrefix = input<string | undefined>(undefined);
  readonly step = input<number | undefined>(undefined);
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly inputId = input<string>('input-' + Math.random().toString(36).substring(2, 7));

  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val);
  }

  get inputClasses(): () => string {
    return () => {
      const base =
        'w-full px-3 py-2 text-sm rounded-[8px] bg-white dark:bg-slate-800 border transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500';
      const pl = this.iconPrefix() ? 'pl-9' : 'pl-3';
      const border = this.error()
        ? 'border-[#D66A6A] focus:border-[#D66A6A] focus:ring-[#D66A6A]/20'
        : 'border-gray-200 dark:border-slate-700 focus:border-[#4F8A6B] focus:ring-[#4F8A6B]/20';

      return `${base} ${pl} ${border}`;
    };
  }
}
