import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { ButtonComponent } from '../button/button';
import { DateRange } from '../../core/models/date-range-picker/date-range-picker.model';

@Component({
  selector: 'app-date-range-picker',
  imports: [AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.css',
})
export class DateRangePicker {
  readonly dateFrom = input<string>('');
  readonly dateTo = input<string>('');
  readonly label = input<string>('Período (Intervalo de Datas)');
  readonly placeholder = input<string>('Selecionar período...');

  readonly rangeChange = output<DateRange>();
  readonly clearRange = output<void>();

  private readonly elementRef = inject(ElementRef);

  readonly isOpen = signal<boolean>(false);
  readonly tempFrom = signal<string>('');
  readonly tempTo = signal<string>('');

  readonly hasRange = computed(() => {
    return !!(this.dateFrom() || this.dateTo());
  });

  readonly displayText = computed(() => {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (from && to) {
      return `${this.formatDisplayDate(from)} à ${this.formatDisplayDate(to)}`;
    }
    if (from) {
      return `A partir de ${this.formatDisplayDate(from)}`;
    }
    if (to) {
      return `Até ${this.formatDisplayDate(to)}`;
    }
    return this.placeholder();
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closePopover();
    }
  }

  togglePopover(): void {
    if (!this.isOpen()) {
      this.tempFrom.set(this.dateFrom());
      this.tempTo.set(this.dateTo());
    }
    this.isOpen.update((v) => !v);
  }

  closePopover(): void {
    this.isOpen.set(false);
  }

  applyPreset(preset: 'today' | 'last7' | 'last30' | 'thisMonth'): void {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    let fromStr = toStr;

    if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromStr = d.toISOString().split('T')[0];
    } else if (preset === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      fromStr = d.toISOString().split('T')[0];
    } else if (preset === 'thisMonth') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      fromStr = d.toISOString().split('T')[0];
    }

    this.tempFrom.set(fromStr);
    this.tempTo.set(toStr);
    this.applyCustomRange();
  }

  applyCustomRange(): void {
    this.rangeChange.emit({
      dateFrom: this.tempFrom(),
      dateTo: this.tempTo(),
    });
    this.closePopover();
  }

  clearAll(): void {
    this.tempFrom.set('');
    this.tempTo.set('');
    this.rangeChange.emit({ dateFrom: '', dateTo: '' });
    this.clearRange.emit();
    this.closePopover();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.clearAll();
  }

  private formatDisplayDate(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  }
}
