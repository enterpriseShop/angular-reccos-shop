import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { SkeletonComponent } from '../skeleton/skeleton';
import { EmptyStateComponent } from '../empty-state/empty-state';
import {
  TableAction,
  TableBadgeConfig,
  TableColumn,
} from '../../core/models/list-table/list-table.model';
import { BadgeVariant, BadgeComponent } from '../badge/badge';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  cell?: (row: T) => string | number | boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AppIconComponent, SkeletonComponent, EmptyStateComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly actions = input<TableAction<T>[]>([]);
  readonly hasActions = input<boolean>(true);
  readonly roundedBottom = input<boolean>(true);
  readonly emptyTitle = input<string>('Nenhum dado encontrado');
  readonly emptyDescription = input<string>('Não existem registros cadastrados para exibição.');

  readonly containerClasses = computed(() => {
    const base =
      'w-full bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden';
    return this.roundedBottom() ? `${base} rounded-[12px]` : `${base} rounded-t-[12px] border-b-0`;
  });

  readonly rowClick = output<T>();
  readonly actionClick = output<{ actionId: string; row: T }>();
  readonly editRow = output<T>();
  readonly deleteRow = output<T>();

  resolveValue(row: T, col: TableColumn<T>): unknown {
    if (col.valueGetter) {
      return col.valueGetter(row);
    }
    const key = col.key;
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: unknown = row;
      for (const p of parts) {
        if (current && typeof current === 'object' && p in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[p];
        } else {
          return undefined;
        }
      }
      return current;
    }
    return row[key];
  }

  getFormattedValue(row: T, col: TableColumn<T>): string {
    if (col.cellFormatter) {
      const res = col.cellFormatter(row);
      return res !== null && res !== undefined ? String(res) : '';
    }

    const val = this.resolveValue(row, col);

    if (col.type === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    }

    if (col.type === 'date' && typeof val === 'string' && val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }

    if (val === null || val === undefined) {
      return '-';
    }

    return String(val);
  }

  getBadgeConfig(row: T, col: TableColumn<T>): TableBadgeConfig {
    if (col.badgeConfig) {
      return col.badgeConfig(row);
    }
    const val = this.resolveValue(row, col);
    if (typeof val === 'boolean') {
      return {
        text: val ? 'Ativo' : 'Inativo',
        variant: val ? 'success' : 'neutral',
      };
    }
    return {
      text: String(val ?? 'N/A'),
      variant: 'neutral',
    };
  }

  mapVariant(v?: string): BadgeVariant {
    switch (v) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'primary':
        return 'primary';
      default:
        return 'neutral';
    }
  }

  getVisibleActions(row: T): TableAction<T>[] {
    const list = this.actions();
    if (list.length > 0) {
      return list.filter((act) => (act.visible ? act.visible(row) : true));
    }
    // Default fallback actions if no explicit actions array passed
    if (this.hasActions()) {
      return [
        {
          id: 'edit',
          label: 'Editar',
          icon: 'edit',
          colorClass: 'text-gray-400 hover:text-[#4F8A6B]',
          title: 'Editar',
          handler: (r) => this.editRow.emit(r),
        },
        {
          id: 'delete',
          label: 'Excluir',
          icon: 'trash-2',
          colorClass: 'text-gray-400 hover:text-[#D66A6A]',
          title: 'Excluir',
          handler: (r) => this.deleteRow.emit(r),
        },
      ];
    }
    return [];
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: TableAction<T>, row: T, event: MouseEvent): void {
    event.stopPropagation();
    if (action.handler) {
      action.handler(row);
    }
    console.log('[ON ACTION CLICK]', action, action.id);
    this.actionClick.emit({ actionId: action.id, row });
    // if (action.id === 'edit') {
    //   this.editRow.emit(row);
    // } else if (action.id === 'delete') {
    //   this.deleteRow.emit(row);
    // }
  }
}
