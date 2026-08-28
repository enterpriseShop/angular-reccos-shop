import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppShellComponent } from './components/app-shell/app-shell';
import { AppInitializerService } from './core/initialization/app-initializer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly initializer = inject(AppInitializerService);

  constructor() {
    afterNextRender(() => {
      void this.initializer.initialize();
    });
  }
}
