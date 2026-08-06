import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorStateComponent {
  readonly title = input<string>('Erro ao carregar dados');
  readonly message = input<string>(
    'Ocorreu uma falha na comunicação com o servidor. Por favor, tente novamente.',
  );

  readonly retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
