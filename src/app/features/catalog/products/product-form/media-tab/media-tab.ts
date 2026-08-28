import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { MediaImageItem } from '../../../models/product-workspace.model';

@Component({
  selector: 'app-product-media-tab',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './media-tab.html',
})
export class ProductMediaTabComponent {
  readonly mediaImages = input<MediaImageItem[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly isDragging = input<boolean>(false);

  readonly dragOver = output<DragEvent>();
  readonly dragLeave = output<DragEvent>();
  readonly fileDrop = output<DragEvent>();
  readonly fileSelected = output<Event>();
  readonly setPrimaryImage = output<string>();
  readonly confirmDeleteImage = output<MediaImageItem>();

  onDragOver(e: DragEvent): void {
    this.dragOver.emit(e);
  }
  onDragLeave(e: DragEvent): void {
    this.dragLeave.emit(e);
  }
  onFileDrop(e: DragEvent): void {
    this.fileDrop.emit(e);
  }
  onFileSelected(e: Event): void {
    this.fileSelected.emit(e);
  }
  onSetPrimaryImage(id: string): void {
    this.setPrimaryImage.emit(id);
  }
  onConfirmDeleteImage(img: MediaImageItem): void {
    this.confirmDeleteImage.emit(img);
  }
}
