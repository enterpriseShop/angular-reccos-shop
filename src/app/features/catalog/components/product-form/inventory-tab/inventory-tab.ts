import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  effect,
  untracked,
} from '@angular/core';
import { AppIconComponent } from '../../../../../design-system/icon/app-icon';
import { DSelectOption } from '../../../../../core/models/design-system/select-option.model';
import { ButtonComponent } from '../../../../../design-system/button/button';
import { TableHeaderOption } from '../../../../../core/models/generals/table-inventory.model';
import { tableHeaders } from './utils/table-values';
import { UpdateProductInventoryPayload } from '../../../../../core/models/products/product-request.model';

export type LocalInventoryItem = UpdateProductInventoryPayload & {
  isDraft?: boolean;
};

@Component({
  selector: 'app-product-inventory-tab',
  standalone: true,
  imports: [AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory-tab.html',
})
export class ProductInventoryTabComponent {
  readonly fieldChange = output<{ field: string; value: string }>();
  readonly numberFieldChange = output<{ field: string; value: string }>();
  readonly nullableNumberFieldChange = output<{ field: string; value: string }>();

  readonly inventories = input<UpdateProductInventoryPayload[]>([]);
  readonly warehouseOptions = input<DSelectOption[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly inventoriesChange = output<UpdateProductInventoryPayload[]>();

  private removedItemsCache = new Map<string, Partial<UpdateProductInventoryPayload>>();
  readonly tableHeaders: TableHeaderOption[] = tableHeaders;

  // Estado Local ÚNICO para a Interface
  readonly localInventories = signal<LocalInventoryItem[]>([]);

  // Computeds apontando estritamente para o localInventories
  readonly totalPhysical = computed(() =>
    this.localInventories().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
  );

  readonly totalReserved = computed(() =>
    this.localInventories().reduce((sum, item) => sum + (Number(item.reserved_quantity) || 0), 0),
  );

  readonly totalAvailable = computed(() =>
    this.localInventories().reduce(
      (sum, item) =>
        sum +
        (item.active !== false
          ? (Number(item.quantity) || 0) - (Number(item.reserved_quantity) || 0)
          : 0),
      0,
    ),
  );

  readonly activeWarehousesCount = computed(
    () => this.localInventories().filter((item) => item.active !== false).length,
  );

  readonly anyBackorderAllowed = computed(() =>
    this.localInventories().some((item) => item.active !== false && item.allow_backorder),
  );

  readonly availableWarehouseOptions = computed(() => {
    const currentItems = this.localInventories() || [];
    const usedWhIds = new Set(currentItems.map((i) => String(i.warehouse_id)));
    return this.warehouseOptions().filter((opt) => !usedWhIds.has(String(opt.value)));
  });

  constructor() {
    effect(() => {
      const incoming = this.inventories() || [];
      untracked(() => {
        this.localInventories.set(incoming);
      });
    });
  }

  getWarehouseOptionsForItem(item: UpdateProductInventoryPayload): DSelectOption[] {
    const currentItems = this.localInventories() || [];
    const otherUsedWhIds = new Set(
      currentItems
        .filter((i) => (i.id && item.id ? i.id !== item.id : i !== item))
        .map((i) => String(i.warehouse_id)),
    );
    return this.warehouseOptions().filter((opt) => !otherUsedWhIds.has(String(opt.value)));
  }

  getWarehouseCode(warehouse_id: string): string {
    if (!warehouse_id) return 'N/A';
    if (warehouse_id === 'wh-01') return 'DC-SP';
    if (warehouse_id === 'wh-02') return 'DF-PR';
    if (warehouse_id === 'wh-03') return 'DD-RJ';
    return String(warehouse_id).toUpperCase();
  }

  addWarehouseDirect(): void {
    if (this.isReadOnly()) return;

    const available = this.availableWarehouseOptions();

    // Garante um item selecionável mesmo que a lista esteja vazia
    const firstWh =
      available && available.length > 0
        ? available[0]
        : this.warehouseOptions() && this.warehouseOptions().length > 0
          ? this.warehouseOptions()[0]
          : null;

    const whId = firstWh ? String(firstWh.value) : 'wh-01';
    const cached = this.removedItemsCache.get(whId);

    const newItem: LocalInventoryItem = {
      id: cached?.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      warehouse_id: whId,
      quantity: cached?.quantity !== undefined ? cached.quantity : 0,
      reserved_quantity: cached?.reserved_quantity !== undefined ? cached.reserved_quantity : 0,
      minimum_quantity: cached?.minimum_quantity !== undefined ? cached.minimum_quantity : 0,
      maximum_quantity: cached?.maximum_quantity !== undefined ? cached.maximum_quantity : null,
      allow_backorder: cached?.allow_backorder !== undefined ? cached.allow_backorder : false,
      active: cached?.active !== undefined ? cached.active : true,
    };

    this.localInventories.update((current) => [...current, newItem]);
    this.emitToParent();
  }

  private emitToParent(): void {
    const activeItems = this.localInventories()
      .filter((item) => !item.isDraft) // se usar a flag isDraft
      .map(({ id, ...payload }) => {
        // Checa se é um ID de rascunho
        const isDraftId = typeof id === 'string' && id.startsWith('draft-');

        // Se for draft, envia sem a chave id. Se for item existente, envia o id original
        return isDraftId ? payload : { id, ...payload };
      });

    this.inventoriesChange.emit(activeItems);
  }

  updateQuantity(index: number, value: string | number): void {
    if (this.isReadOnly()) return;
    const num = Math.max(0, Number(value) || 0);
    const currentItem = this.localInventories()[index];
    if (!currentItem) return;

    this.localInventories.update((current) =>
      current.map((item, i) => (i === index ? { ...item, quantity: num } : item)),
    );
    this.emitToParent();
  }

  adjustQuantity(index: number, delta: number): void {
    if (this.isReadOnly()) return;
    const current = Number(this.localInventories()[index]?.quantity) || 0;
    const nextVal = Math.max(0, current + delta);
    this.updateQuantity(index, nextVal);
  }

  updateMinQuantity(index: number, value: string | number): void {
    if (this.isReadOnly()) return;
    const num = Math.max(0, Number(value) || 0);
    const currentItem = this.localInventories()[index];
    if (!currentItem) return;

    this.localInventories.update((current) =>
      current.map((item, i) => (i === index ? { ...item, minimum_quantity: num } : item)),
    );
    this.emitToParent();
  }

  updateMaxQuantity(index: number, value: string): void {
    if (this.isReadOnly()) return;
    const num = value.trim() === '' ? null : Math.max(0, Number(value) || 0);
    const currentItem = this.localInventories()[index];
    if (!currentItem) return;

    this.localInventories.update((current) =>
      current.map((item, i) => (i === index ? { ...item, maximum_quantity: num } : item)),
    );
    this.emitToParent();
  }

  changeWarehouse(index: number, newWarehouseId: string): void {
    if (this.isReadOnly()) return;
    const oldItem = this.localInventories()[index];
    if (oldItem && oldItem.warehouse_id) {
      this.removedItemsCache.set(String(oldItem.warehouse_id), { ...oldItem });
    }

    const cached = this.removedItemsCache.get(String(newWarehouseId));

    const updatedItem: LocalInventoryItem = {
      ...oldItem,
      warehouse_id: newWarehouseId,
      quantity: cached?.quantity !== undefined ? cached.quantity : oldItem.quantity,
      reserved_quantity:
        cached?.reserved_quantity !== undefined
          ? cached.reserved_quantity
          : oldItem.reserved_quantity,
      minimum_quantity:
        cached?.minimum_quantity !== undefined ? cached.minimum_quantity : oldItem.minimum_quantity,
      maximum_quantity:
        cached?.maximum_quantity !== undefined ? cached.maximum_quantity : oldItem.maximum_quantity,
      allow_backorder:
        cached?.allow_backorder !== undefined ? cached.allow_backorder : oldItem.allow_backorder,
      active: cached?.active !== undefined ? cached.active : oldItem.active,
    };

    this.localInventories.update((current) =>
      current.map((item, i) => (i === index ? updatedItem : item)),
    );
    this.emitToParent();
  }

  removeItem(index: number): void {
    if (this.isReadOnly()) return;

    const currentList = this.localInventories();
    const target = currentList[index];
    if (!target) return;

    if (target.warehouse_id) {
      this.removedItemsCache.set(String(target.warehouse_id), { ...target });
    }

    this.localInventories.update((current) => current.filter((_, i) => i !== index));
    this.emitToParent();
  }

  toggleBackorder(index: number): void {
    if (this.isReadOnly()) return;
    const currentItem = this.localInventories()[index];
    if (!currentItem) return;

    this.localInventories.update((current) =>
      current.map((item, i) =>
        i === index ? { ...item, allow_backorder: !item.allow_backorder } : item,
      ),
    );
    this.emitToParent();
  }

  toggleActive(index: number): void {
    if (this.isReadOnly()) return;
    const currentItem = this.localInventories()[index];
    if (!currentItem) return;

    this.localInventories.update((current) =>
      current.map((item, i) => (i === index ? { ...item, active: !item.active } : item)),
    );
    this.emitToParent();
  }

  getStockLevelBadge(item: UpdateProductInventoryPayload) {
    if (item.active === false) {
      return {
        label: 'Inativo',
        class:
          'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400 border-gray-200 dark:border-slate-600',
        icon: 'slash',
      };
    }
    const avail = (item.quantity || 0) - (item.reserved_quantity || 0);
    if (avail <= 0) {
      return {
        label: 'Sem Estoque',
        class:
          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/50',
        icon: 'x-circle',
      };
    }
    if ((item.minimum_quantity || 0) > 0 && avail < (item.minimum_quantity || 0)) {
      return {
        label: 'Abaixo do Mínimo',
        class:
          'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
        icon: 'alert-triangle',
      };
    }
    return {
      label: 'Estoque OK',
      class:
        'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
      icon: 'check-circle',
    };
  }

  getWarehouseName(warehouse_id: string): string {
    const found = this.warehouseOptions().find((w) => String(w.value) === String(warehouse_id));
    return found?.label || warehouse_id;
  }
}
