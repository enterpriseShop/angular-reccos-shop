import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css'
})
export class SkeletonComponent {
  readonly width = input<string>('w-full');
  readonly height = input<string>('h-4');
  readonly rounded = input<string>('rounded-md');

  get classes(): () => string {
    return () => `${this.width()} ${this.height()} ${this.rounded()}`;
  }
}
