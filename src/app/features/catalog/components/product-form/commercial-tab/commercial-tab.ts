import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { InputComponent } from '../../../../../design-system/input/input';

@Component({
  selector: 'app-product-commercial-tab',
  standalone: true,
  imports: [
    InputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './commercial-tab.html'
})
export class ProductCommercialTabComponent {
  readonly formPrice = input<number>(0);
  readonly formPromotionalPrice = input<number | null>(null);
  readonly formPromotionStartDate = input<string>('');
  readonly formPromotionEndDate = input<string>('');
  readonly formIsInvoiced = input<boolean>(true);

  readonly isReadOnly = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly fieldChange = output<{ field: string; value: string }>();
  readonly numberFieldChange = output<{ field: string; value: string }>();
  readonly nullableNumberFieldChange = output<{ field: string; value: string }>();
  readonly toggleIsInvoiced = output<void>();

  onFieldChange(field: string, value: string): void {
    this.fieldChange.emit({ field, value });
  }

  onNumberFieldChange(field: string, value: string): void {
    this.numberFieldChange.emit({ field, value });
  }

  onNullableNumberFieldChange(field: string, value: string): void {
    this.nullableNumberFieldChange.emit({ field, value });
  }

  onToggleIsInvoiced(): void {
    this.toggleIsInvoiced.emit();
  }
}
