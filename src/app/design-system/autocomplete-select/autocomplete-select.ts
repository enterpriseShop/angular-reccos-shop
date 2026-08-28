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
  OnDestroy,
} from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { GeneralOptionQuery } from '../../core/models/generals/general-option-query.model';
import { AutocompleteOption } from '../../core/models/design-system/auto-complete.model';

@Component({
  selector: 'app-autocomplete-select',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './autocomplete-select.html',
  styleUrl: './autocomplete-select.css',
})
export class AutocompleteSelectComponent implements OnDestroy {
  private elementRef = inject(ElementRef);

  readonly label = input<string | undefined>(undefined);
  readonly value = input<string | number>('');
  readonly placeholder = input<string>('Selecione ou digite para buscar...');
  readonly options = input.required<AutocompleteOption[]>();
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  // readonly loading = input<boolean>(false);
  readonly remoteSearch = input<boolean>(false);
  readonly emptyText = input<string>('Nenhum resultado encontrado.');
  readonly selectId = input<string>('autocomplete-' + Math.random().toString(36).substring(2, 7));

  readonly loading = signal<boolean>(false);

  readonly valueChange = output<string>();
  readonly optionSelect = output<AutocompleteOption>();
  readonly searchQueryChange = output<GeneralOptionQuery>();

  readonly isOpen = signal<boolean>(false);
  readonly filterQuery = signal<string>('');
  readonly highlightedIndex = signal<number>(-1);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Selected Option Object for rendering
  readonly selectedOption = computed(() => {
    const val = this.value();
    if (val === undefined || val === null || val === '') return null;
    const found = this.options().find((opt) => String(opt.label) === String(val));
    if (found) return found;

    // Fallback: search by label if value was populated as label
    const foundByLabel = this.options().find(
      (opt) => opt.label.toLowerCase() === String(val).toLowerCase(),
    );
    if (foundByLabel) return foundByLabel;

    return {
      label: String(val),
      value: val,
    };
  });

  // Display Text shown in input
  readonly displayText = computed(() => {
    if (this.isOpen()) {
      return this.filterQuery();
    }
    const sel = this.selectedOption();
    return sel ? sel.label : '';
  });

  // Filtered options for local search or remote options
  readonly filteredOptions = computed(() => {
    const opts = this.options();
    const q = this.filterQuery().toLowerCase().trim();

    if (this.remoteSearch() || !q) {
      return opts;
    }

    return opts.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        String(opt.label).toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)),
    );
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
    // When opening, reset query or keep selected label for quick editing
    const sel = this.selectedOption();
    this.filterQuery.set(sel ? sel.label : '');
    this.highlightedIndex.set(-1);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.filterQuery.set('');
    this.highlightedIndex.set(-1);
  }

  onInputTextChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    this.filterQuery.set(text);

    const result: GeneralOptionQuery = {
      search: null,
      active: null,
      per_page: null,
      page: null,
      manufacturer_id: null,
    };

    if (!this.isOpen()) {
      this.isOpen.set(true);
    }

    // Handle debounce emit for remote database search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.searchQueryChange.emit(result);
    }, 250);
  }

  selectOption(opt: AutocompleteOption, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (opt.disabled) return;

    this.valueChange.emit(String(opt.label));
    this.optionSelect.emit(opt);
    this.closeDropdown();
  }

  isOptionSelected(optValue: string | number): boolean {
    return String(optValue) === String(this.value());
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.valueChange.emit('');
    this.filterQuery.set('');
    const result: GeneralOptionQuery = {
      search: null,
      active: null,
      per_page: null,
      page: null,
      manufacturer_id: null,
    };
    this.searchQueryChange.emit(result);
    if (this.isOpen()) {
      this.closeDropdown();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (!this.isOpen() && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      this.openDropdown();
      event.preventDefault();
      return;
    }

    if (!this.isOpen()) return;

    const list = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update((i) => (i < list.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update((i) => (i > 0 ? i - 1 : list.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex() >= 0 && this.highlightedIndex() < list.length) {
          this.selectOption(list[this.highlightedIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
