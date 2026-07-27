import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class ToolbarComponent {}
