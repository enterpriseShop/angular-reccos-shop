import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyStateComponent {
  readonly icon = input<string>('box');
  readonly title = input<string>('Nenhum registro encontrado');
  readonly description = input<string>(
    'Não há dados disponíveis para exibição neste módulo ou filtro.',
  );
  readonly actionLabel = input<string | undefined>(undefined);

  readonly actionClick = output<void>();

  onAction(): void {
    this.actionClick.emit();
  }
}
