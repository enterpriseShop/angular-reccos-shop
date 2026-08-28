import { Component, ChangeDetectionStrategy, computed, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { PaginationComponent } from '../../../../../design-system/pagination/pagination';
import { FormTab } from '../../../models/product-workspace.model';
import { ProductSupplier } from '../../../../../core/models/suppliers/suppliers-product.model';
import { ProductNote } from '../../../../../core/models/notes/notes.model';

export interface TagItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-product-administration-tab',
  standalone: true,
  imports: [ButtonComponent, AppIconComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administration-tab.html',
})
export class ProductAdministrationTabComponent {
  readonly activeTab = input.required<FormTab>();
  readonly suppliers = input<ProductSupplier[]>([]);
  readonly availableTags = input<TagItem[]>([]);
  readonly selectedTagIds = input<string[]>([]);
  readonly productNotes = input<ProductNote[]>([]);
  readonly isReadOnly = input<boolean>(false);

  readonly addSupplier = output<void>();
  readonly removeSupplier = output<string>();
  readonly setPreferentialSupplier = output<string>();
  readonly toggleSupplierStatus = output<string>();
  readonly toggleTag = output<string>();
  readonly addNote = output<void>();
  readonly removeNote = output<string>();
  readonly toggleNoteStatus = output<string>();

  readonly suppliersPage = signal(1);
  readonly suppliersPageSize = signal(10);
  readonly notesPage = signal(1);
  readonly notesPageSize = signal(10);

  readonly suppliersPaginated = computed(() =>
    this.paginate(this.suppliers(), this.suppliersPage(), this.suppliersPageSize()),
  );
  readonly notesPaginated = computed(() =>
    this.paginate(this.productNotes(), this.notesPage(), this.notesPageSize()),
  );

  onAddSupplier(): void {
    this.addSupplier.emit();
  }
  onRemoveSupplier(id: string): void {
    this.removeSupplier.emit(id);
  }
  onSetPreferentialSupplier(id: string): void {
    if (this.isReadOnly()) return;
    this.setPreferentialSupplier.emit(id);
  }
  onToggleSupplierStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleSupplierStatus.emit(id);
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds().includes(tagId);
  }

  onToggleTag(tagId: string): void {
    if (this.isReadOnly()) return;
    this.toggleTag.emit(tagId);
  }

  onAddNote(): void {
    this.addNote.emit();
  }
  onRemoveNote(id: string): void {
    this.removeNote.emit(id);
  }
  onToggleNoteStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.toggleNoteStatus.emit(id);
  }

  private paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }
}
