import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ShellStateService } from '../../core/services/shell-state';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly shellState = inject(ShellStateService);
}
