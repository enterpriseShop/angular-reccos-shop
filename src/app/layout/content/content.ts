import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellStateService } from '../../core/services/shell-state';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class ContentComponent {
  readonly shellState = inject(ShellStateService);
}
