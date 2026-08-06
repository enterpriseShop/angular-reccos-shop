import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { InputComponent } from '../../../../../../design-system/input/input';
import { SelectComponent } from '../../../../../../design-system/select/select';
import { DSelectOption } from '../../../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-product-dimensions-section',
  standalone: true,
  imports: [InputComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white dark:bg-slate-800 rounded-[12px] border border-gray-200/80 dark:border-slate-700/80 p-6 shadow-2xs space-y-4"
    >
      <div class="border-b border-gray-100 dark:border-slate-700/60 pb-3">
        <h3 class="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
          Informações Físicas & Logísticas
        </h3>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Unidade de medida, peso bruto e dimensões da embalagem para cálculo de frete
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Unidade de Medida -->
        <app-select
          label="Unidade de Medida"
          placeholder="Selecione..."
          [options]="unitOptions()"
          [value]="formUnitId()"
          [disabled]="isReadOnly()"
          (valueChange)="fieldChange.emit({ field: 'unit_id', value: $event })"
        />

        <!-- Peso -->
        <app-input
          type="number"
          [step]="0.001"
          [min]="0"
          label="Peso Bruto (kg)"
          placeholder="0.00"
          [value]="formWeight() ? formWeight().toString() : ''"
          [disabled]="isReadOnly()"
          (valueChange)="numberFieldChange.emit({ field: 'weight', value: $event })"
        />

        <!-- Altura -->
        <app-input
          type="number"
          label="Altura (cm)"
          placeholder="0.0"
          [step]="0.001"
          [min]="0"
          [value]="formHeight() ? formHeight().toString() : ''"
          [disabled]="isReadOnly()"
          (valueChange)="numberFieldChange.emit({ field: 'height', value: $event })"
        />

        <!-- Largura -->
        <app-input
          type="number"
          label="Largura (cm)"
          placeholder="0.0"
          [step]="0.001"
          [min]="0"
          [value]="formWidth() ? formWidth().toString() : ''"
          [disabled]="isReadOnly()"
          (valueChange)="numberFieldChange.emit({ field: 'width', value: $event })"
        />

        <!-- Comprimento -->
        <app-input
          type="number"
          label="Comprimento (cm)"
          placeholder="0.0"
          [step]="0.001"
          [min]="0"
          [value]="formLength() ? formLength().toString() : ''"
          [disabled]="isReadOnly()"
          (valueChange)="numberFieldChange.emit({ field: 'length', value: $event })"
        />
      </div>
    </div>
  `,
})
export class ProductDimensionsSectionComponent {
  readonly formUnitId = input<string>('');
  readonly formWeight = input<number>(0);
  readonly formHeight = input<number>(0);
  readonly formWidth = input<number>(0);
  readonly formLength = input<number>(0);

  readonly isReadOnly = input<boolean>(false);
  readonly unitOptions = input<DSelectOption[]>([]);
  readonly warehouseOptions = input<DSelectOption[]>([]);

  readonly fieldChange = output<{ field: string; value: string }>();
  readonly numberFieldChange = output<{ field: string; value: string }>();
}
