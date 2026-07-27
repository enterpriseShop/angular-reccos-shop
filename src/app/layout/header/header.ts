import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShellStateService } from '../../core/services/shell-state';
import { ThemeService } from '../../core/services/theme';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { SearchInputComponent } from '../../design-system/input/search-input';
import { DropdownComponent, DropdownItem } from '../../design-system/dropdown/dropdown';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppIconComponent, SearchInputComponent, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  readonly shellState = inject(ShellStateService);
  readonly themeService = inject(ThemeService);
  private router = inject(Router);

  readonly userMenuItems: DropdownItem[] = [
    { id: 'profile', label: 'Meu Perfil', icon: 'user' },
    { id: 'settings', label: 'Configurações de Conta', icon: 'settings' },
    { id: 'help', label: 'Suporte & Documentação', icon: 'help-circle' },
    { id: 'div1', label: '', divider: true },
    { id: 'logout', label: 'Sair da Conta', icon: 'log-out', danger: true }
  ];

  navigateHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
