import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { SelectOption } from '../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class SelectComponent {
  readonly label = input<string | undefined>(undefined);
  readonly value = input<string | number>('');
  readonly placeholder = input<string>('Selecione uma opção');
  readonly options = input.required<SelectOption[]>();
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string | undefined>(undefined);
  readonly selectId = input<string>('select-' + Math.random().toString(36).substring(2, 7));

  readonly valueChange = output<string>();

  onChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.valueChange.emit(val);
  }
}
