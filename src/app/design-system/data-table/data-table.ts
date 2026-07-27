import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { AppIconComponent } from '../icon/app-icon';
import { SkeletonComponent } from '../skeleton/skeleton';
import { EmptyStateComponent } from '../empty-state/empty-state';

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
  imports: [AppIconComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly hasActions = input<boolean>(true);
  readonly roundedBottom = input<boolean>(true);
  readonly emptyTitle = input<string>('Nenhum dado encontrado');
  readonly emptyDescription = input<string>('Não existem registros cadastrados para exibição.');

  readonly containerClasses = computed(() => {
    const base = 'w-full bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 shadow-2xs overflow-hidden';
    return this.roundedBottom()
      ? `${base} rounded-[12px]`
      : `${base} rounded-t-[12px] border-b-0`;
  });

  readonly rowClick = output<T>();
  readonly editRow = output<T>();
  readonly deleteRow = output<T>();

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onEdit(row: T): void {
    this.editRow.emit(row);
  }

  onDelete(row: T): void {
    this.deleteRow.emit(row);
  }
}
