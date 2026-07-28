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
  readonly size = input<string>('w-5 h-5');

  readonly wrapperClasses = computed(() => {
    return `${this.size()}`;
  });
}
