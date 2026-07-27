import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from './layout/app-shell';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
