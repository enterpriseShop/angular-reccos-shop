import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from './components/app-shell/app-shell';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
