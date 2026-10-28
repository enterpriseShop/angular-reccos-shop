import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  ElementRef,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '../icon/app-icon';
import { GeneralOption } from '../../core/models/generals/general-options-response.model';

export interface MultiSelectOption extends GeneralOption {
  disabled?: boolean;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
})
export class MultiSelectComponent {
  private elementRef = inject(ElementRef);

  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string>('Selecione uma ou mais opções...');
  readonly searchPlaceholder = input<string>('Filtrar opções...');
  readonly options = input.required<(GeneralOption | MultiSelectOption)[]>();
  readonly selectedValues = input<string[]>([]);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  readonly emptyText = input<string>('Nenhuma opção encontrada.');
  readonly selectId = input<string>('multi-select-' + Math.random().toString(36).substring(2, 7));

  readonly selectionChange = output<string[]>();

  readonly isOpen = signal<boolean>(false);
  readonly filterQuery = signal<string>('');

  // Map of selected items for O(1) lookup
  readonly selectedSet = computed(() => new Set(this.selectedValues() || []));

  // Resolved list of selected option objects
  readonly selectedOptions = computed(() => {
    const set = this.selectedSet();
    const all = this.options();
    if (!all || all.length === 0) return [];
    return all.filter((opt) => set.has(String(opt.value)));
  });

  // Filtered list of options based on search query
  readonly filteredOptions = computed(() => {
    const q = this.filterQuery().trim().toLowerCase();
    const all = this.options() || [];
    if (!q) return all;

    return all.filter((opt) => {
      const matchLabel = opt.label?.toLowerCase().includes(q);
      const matchSublabel = opt.sublabel?.toLowerCase().includes(q);
      return Boolean(matchLabel || matchSublabel);
    });
  });

  toggleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled()) return;
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) {
      this.filterQuery.set('');
    }
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.filterQuery.set('');
  }

  onFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterQuery.set(target.value);
  }

  isOptionSelected(value: string | number): boolean {
    return this.selectedSet().has(String(value));
  }

  toggleOption(opt: GeneralOption | MultiSelectOption, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled() || (opt as MultiSelectOption).disabled) return;

    const val = String(opt.value);
    const current = [...(this.selectedValues() || [])];
    const index = current.indexOf(val);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(val);
    }

    this.selectionChange.emit(current);
  }

  removeOption(value: string | number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled()) return;

    const val = String(value);
    const current = (this.selectedValues() || []).filter((v) => String(v) !== val);
    this.selectionChange.emit(current);
  }

  clearAll(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled()) return;
    this.selectionChange.emit([]);
  }

  selectAllFiltered(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled()) return;

    const available = this.filteredOptions()
      .filter((opt) => !(opt as MultiSelectOption).disabled)
      .map((opt) => String(opt.value));

    const currentSet = new Set(this.selectedValues() || []);
    for (const id of available) {
      currentSet.add(id);
    }

    this.selectionChange.emit(Array.from(currentSet));
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
