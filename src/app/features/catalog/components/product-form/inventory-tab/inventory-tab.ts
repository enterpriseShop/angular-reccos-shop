import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { InputComponent } from '../../../../../design-system/input/input';
import { SelectComponent } from '../../../../../design-system/select/select';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { DSelectOption } from '../../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-product-inventory-tab',
  standalone: true,
  imports: [InputComponent, SelectComponent, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory-tab.html',
})
export class ProductInventoryTabComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    console.log('[INVENTORY TAB - CHANGES]', changes);
  }
  readonly formWarehouseId = input<string>('');
  readonly formQuantity = input<number>(0);
  readonly formMinQuantity = input<number>(0);
  readonly formMaxQuantity = input<number | null>(null);
  readonly formAllowBackorder = input<boolean>(false);

  readonly warehouseOptions = input<DSelectOption[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly fieldChange = output<{ field: string; value: string }>();
  readonly numberFieldChange = output<{ field: string; value: string }>();
  readonly nullableNumberFieldChange = output<{ field: string; value: string }>();
  readonly toggleBackorder = output<void>();

  onFieldChange(field: string, value: string): void {
    console.log('onFieldChange', field, value);
    this.fieldChange.emit({ field, value });
  }

  onNumberFieldChange(field: string, value: string): void {
    this.numberFieldChange.emit({ field, value });
  }

  onNullableNumberFieldChange(field: string, value: string): void {
    this.nullableNumberFieldChange.emit({ field, value });
  }

  onToggleBackorder(): void {
    this.toggleBackorder.emit();
  }
}
