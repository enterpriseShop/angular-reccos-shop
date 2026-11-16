import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-icon.html',
  styleUrl: './app-icon.css',
})
export class AppIconComponent {
  readonly name = input.required<string>();
  readonly size = input<string>('1x');
  readonly variant = input<'line' | 'fill'>('line');

  readonly iconClass = computed(() => `ri-${this.name()}-${this.variant()} ${this.size()}`);
}
