import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ShellStateService } from '../../core/services/shell-state';
import { MenuItem } from '../../core/models/menu-item';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { BadgeComponent } from '../../design-system/badge/badge';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppIconComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  readonly shellState = inject(ShellStateService);
  private router = inject(Router);

  readonly expandedGroupIds = signal<Set<string>>(new Set(['cat', 'comp']));

  isExpanded(itemId: string): boolean {
    return this.expandedGroupIds().has(itemId);
  }

  toggleGroup(itemId: string): void {
    const next = new Set(this.expandedGroupIds());
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    this.expandedGroupIds.set(next);
  }

  isRouteActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  onItemClick(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleGroup(item.id);
    } else if (item.route) {
      this.shellState.setActiveRoute(item.route);
      this.router.navigate([item.route]);
      this.shellState.closeMobileDrawer();
    }
  }

  onChildClick(route?: string): void {
    if (route) {
      this.shellState.setActiveRoute(route);
      this.router.navigate([route]);
      this.shellState.closeMobileDrawer();
    }
  }

  getItemClasses(item: MenuItem): string {
    const active = this.isRouteActive(item.route);
    const base = 'w-full flex items-center justify-between px-3 py-2 text-xs rounded-[10px] transition-all cursor-pointer select-none';
    const activeStyle = active
      ? 'bg-[#EAF4EE] dark:bg-[#4F8A6B]/20 text-[#4F8A6B] dark:text-[#5BAE6A] font-bold shadow-xs'
      : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60 hover:text-gray-900 dark:hover:text-slate-100';

    return `${base} ${activeStyle}`;
  }
}
