import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { ProductBasicInfoSectionComponent } from './sections/basic-info-section';
import { ProductIdentificationSectionComponent } from './sections/identification-section';
import { ProductDimensionsSectionComponent } from './sections/dimensions-section';
import { ProductVisibilitySectionComponent } from './sections/visibility-section';
import { GeneralOptionQuery } from '../../../../../core/models/generals/general-option-query.model';
import {
  ProductGeneralFormData,
  ProductGeneralFormOptions,
} from '../../../../../core/models/products/product-create.model';

@Component({
  selector: 'app-product-general-tab',
  standalone: true,
  imports: [
    ProductBasicInfoSectionComponent,
    ProductIdentificationSectionComponent,
    ProductDimensionsSectionComponent,
    ProductVisibilitySectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './general-tab.html',
})
export class ProductGeneralTabComponent {
  readonly form = input.required<ProductGeneralFormData>();
  readonly options = input.required<ProductGeneralFormOptions>();

  readonly isReadOnly = input<boolean>(false);
  readonly isCreateMode = input<boolean>(false);
  readonly currentStep = input<number>(0);
  readonly errors = input<Record<string, string>>({});

  // Outputs
  readonly fieldChange = output<{ field: string; value: string }>();
  readonly numberFieldChange = output<{ field: string; value: string }>();
  readonly booleanFieldChange = output<{ field: string; value: boolean }>();
  readonly categorySearch = output<GeneralOptionQuery>();
  readonly manufacturerSearch = output<GeneralOptionQuery>();
  readonly descriptionChange = output<string>();

  onFieldChange(field: string, value: string): void {
    this.fieldChange.emit({ field, value });
  }

  onNumberFieldChange(field: string, value: string): void {
    this.numberFieldChange.emit({ field, value });
  }

  onBooleanFieldToggle(field: string, currentValue: boolean): void {
    if (this.isReadOnly()) return;
    this.booleanFieldChange.emit({ field, value: !currentValue });
  }
}
