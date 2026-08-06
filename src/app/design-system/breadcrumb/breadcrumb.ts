import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
