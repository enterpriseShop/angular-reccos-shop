import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';

@Component({
  selector: 'app-product-create-stepper',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-create-stepper.html'
})
export class ProductCreateStepperComponent {
  readonly currentStep = input.required<number>();
  readonly stepChange = output<number>();

  setStep(step: number): void {
    this.stepChange.emit(step);
  }
}
