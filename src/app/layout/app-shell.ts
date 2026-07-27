import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from './header/header';
import { SidebarComponent } from './sidebar/sidebar';
import { ContentComponent } from './content/content';
import { FooterComponent } from './footer/footer';
import { NotificationsDrawerComponent } from './notifications-drawer';
import { ToastContainerComponent } from '../design-system/toast/toast';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    ContentComponent,
    FooterComponent,
    NotificationsDrawerComponent,
    ToastContainerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css'
})
export class AppShellComponent {}
