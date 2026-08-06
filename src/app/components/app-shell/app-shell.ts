import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { ContentComponent } from '../../layout/content/content';
import { FooterComponent } from '../../layout/footer/footer';
import { NotificationsDrawerComponent } from '../notifications-drawer/notifications-drawer';
import { ToastContainerComponent } from '../../design-system/toast/toast';
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    ContentComponent,
    FooterComponent,
    NotificationsDrawerComponent,
    ToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShellComponent {}
