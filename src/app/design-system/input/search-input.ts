import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInputComponent {
  readonly value = input<string>('');
  readonly placeholder = input<string>('Pesquisar produtos, categorias, fabricantes...');

  readonly valueChange = output<string>();
  readonly searchSubmit = output<string>();

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val);
  }

  onEnter(): void {
    this.searchSubmit.emit(this.value());
  }

  clear(): void {
    this.valueChange.emit('');
    this.searchSubmit.emit('');
  }
}
