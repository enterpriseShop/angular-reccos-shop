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
import { SelectOption } from '../../../../../core/models/design-system/select-option.model';
import { ButtonComponent } from '../../../../../design-system/button/button';
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
  readonly inventories = input<UpdateProductInventoryPayload[]>([]);
  readonly warehouseOptions = input<SelectOption[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly inventoriesChange = output<UpdateProductInventoryPayload[]>();

  /**
   * Mantém o estado anterior de um depósito removido.
   * Quando ele for selecionado novamente, seus dados podem ser restaurados.
   */
  private readonly removedItemsCache = new Map<string, Partial<UpdateProductInventoryPayload>>();

  /**
   * Estado local usado pela interface.
   *
   * Mantido para preservar o comportamento da primeira versão,
   * permitindo edição inline sem depender exclusivamente do ciclo
   * de atualização do componente pai.
   */
  readonly localInventories = signal<LocalInventoryItem[]>([]);

  readonly fieldChange = output<{ field: string; value: string }>();

  readonly numberFieldChange = output<{
    field: string;
    value: string;
  }>();

  readonly nullableNumberFieldChange = output<{
    field: string;
    value: string;
  }>();

  constructor() {
    effect(() => {
      const incoming = this.inventories() || [];
      untracked(() => {
        this.localInventories.set(incoming);
      });
    });
  }

  /**
   * ==============================
   * AGGREGATIONS
   * ==============================
   */

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
    this.localInventories().some((item) => item.active !== false && item.allow_backorder === true),
  );

  /**
   * Depósitos que ainda podem ser adicionados.
   */
  readonly availableWarehouseOptions = computed(() => {
    const currentItems = this.localInventories();

    const usedWhIds = new Set(currentItems.map((item) => String(item.warehouse_id)));

    return this.warehouseOptions().filter((option) => !usedWhIds.has(String(option.value)));
  });

  /**
   * ==============================
   * WAREHOUSE HELPERS
   * ==============================
   */

  getWarehouseOptionsForItem(item: UpdateProductInventoryPayload): SelectOption[] {
    const currentItems = this.localInventories();

    const otherUsedWhIds = new Set(
      currentItems
        .filter((currentItem) =>
          currentItem.id && item.id ? currentItem.id !== item.id : currentItem !== item,
        )
        .map((currentItem) => String(currentItem.warehouse_id)),
    );

    return this.warehouseOptions().filter((option) => !otherUsedWhIds.has(String(option.value)));
  }

  getWarehouseName(warehouseId: string): string {
    if (!warehouseId) {
      return 'N/A';
    }

    const found = this.warehouseOptions().find(
      (warehouse) => String(warehouse.value) === String(warehouseId),
    );

    return found?.label || warehouseId;
  }

  getWarehouseCode(warehouseId: string): string {
    if (!warehouseId) {
      return 'N/A';
    }

    return String(warehouseId).toUpperCase();
  }

  /**
   * ==============================
   * ADD / REMOVE WAREHOUSE
   * ==============================
   */

  addWarehouseDirect(): void {
    if (this.isReadOnly()) {
      return;
    }

    const available = this.availableWarehouseOptions();

    if (!available.length) {
      return;
    }

    const firstWarehouse = available[0];

    const warehouseId = String(firstWarehouse.value);

    const cached = this.removedItemsCache.get(warehouseId);

    const newItem: LocalInventoryItem = {
      id: cached?.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,

      warehouse_id: warehouseId,

      quantity: cached?.quantity !== undefined ? cached.quantity : 0,

      reserved_quantity: cached?.reserved_quantity !== undefined ? cached.reserved_quantity : 0,

      minimum_quantity: cached?.minimum_quantity !== undefined ? cached.minimum_quantity : 0,

      maximum_quantity: cached?.maximum_quantity !== undefined ? cached.maximum_quantity : null,

      allow_backorder: cached?.allow_backorder !== undefined ? cached.allow_backorder : false,

      active: cached?.active !== undefined ? cached.active : true,
    } as LocalInventoryItem;

    this.localInventories.update((current) => [...current, newItem]);

    this.emitToParent();
  }

  removeItem(index: number): void {
    if (this.isReadOnly()) {
      return;
    }

    const currentList = this.localInventories();
    const target = currentList[index];

    if (!target) {
      return;
    }

    if (target.warehouse_id) {
      this.removedItemsCache.set(String(target.warehouse_id), { ...target });
    }

    this.localInventories.update((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );

    this.emitToParent();
  }

  /**
   * ==============================
   * INLINE EDITING
   * ==============================
   */

  updateQuantity(index: number, value: string | number): void {
    if (this.isReadOnly()) {
      return;
    }

    const num = Math.max(0, Number(value) || 0);

    const currentItem = this.localInventories()[index];

    if (!currentItem) {
      return;
    }

    this.localInventories.update((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              quantity: num,
            }
          : item,
      ),
    );

    this.emitToParent();
  }

  adjustQuantity(index: number, delta: number): void {
    if (this.isReadOnly()) {
      return;
    }

    const current = Number(this.localInventories()[index]?.quantity) || 0;

    const nextValue = Math.max(0, current + delta);

    this.updateQuantity(index, nextValue);
  }

  updateMinQuantity(index: number, value: string | number): void {
    if (this.isReadOnly()) {
      return;
    }

    const num = Math.max(0, Number(value) || 0);

    const currentItem = this.localInventories()[index];

    if (!currentItem) {
      return;
    }

    this.localInventories.update((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              minimum_quantity: num,
            }
          : item,
      ),
    );

    this.emitToParent();
  }

  updateMaxQuantity(index: number, value: string): void {
    if (this.isReadOnly()) {
      return;
    }

    const num = value.trim() === '' ? null : Math.max(0, Number(value) || 0);

    const currentItem = this.localInventories()[index];

    if (!currentItem) {
      return;
    }

    this.localInventories.update((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              maximum_quantity: num,
            }
          : item,
      ),
    );

    this.emitToParent();
  }

  /**
   * ==============================
   * WAREHOUSE CHANGE
   * ==============================
   */

  changeWarehouse(index: number, newWarehouseId: string): void {
    if (this.isReadOnly()) {
      return;
    }

    const currentList = this.localInventories();

    const oldItem = currentList[index];

    if (!oldItem) {
      return;
    }

    /**
     * Guarda o estado anterior do depósito.
     */
    if (oldItem.warehouse_id) {
      this.removedItemsCache.set(String(oldItem.warehouse_id), { ...oldItem });
    }

    /**
     * Se o depósito já foi utilizado anteriormente,
     * restaura seus dados.
     */
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
    } as LocalInventoryItem;

    this.localInventories.update((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? updatedItem : item)),
    );
    this.emitToParent();
  }

  /**
   * ==============================
   * TOGGLES
   * ==============================
   */

  toggleBackorder(index: number): void {
    if (this.isReadOnly()) {
      return;
    }

    const currentItem = this.localInventories()[index];

    if (!currentItem) {
      return;
    }

    this.localInventories.update((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              allow_backorder: !item.allow_backorder,
            }
          : item,
      ),
    );

    this.emitToParent();
  }

  toggleActive(index: number): void {
    if (this.isReadOnly()) {
      return;
    }

    const currentItem = this.localInventories()[index];

    if (!currentItem) {
      return;
    }

    this.localInventories.update((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              active: !item.active,
            }
          : item,
      ),
    );

    this.emitToParent();
  }

  /**
   * ==============================
   * STOCK STATUS
   * ==============================
   */

  getStockLevelBadge(item: UpdateProductInventoryPayload): {
    label: string;
    class: string;
    icon: string;
  } {
    if (item.active === false) {
      return {
        label: 'Inativo',
        class:
          'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400 border-gray-200 dark:border-slate-600',
        icon: 'slash',
      };
    }

    const available = (Number(item.quantity) || 0) - (Number(item.reserved_quantity) || 0);

    if (available <= 0) {
      return {
        label: 'Sem Estoque',
        class:
          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/50',
        icon: 'x-circle',
      };
    }

    const minimum = Number(item.minimum_quantity) || 0;

    if (minimum > 0 && available < minimum) {
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

  /**
   * ==============================
   * PARENT EMISSION
   * ==============================
   */

  private emitToParent(): void {
    const items = this.localInventories().map((item) => {
      const payload = { ...item };

      if (item.isDraft || (typeof item.id === 'string' && item.id.startsWith('draft-'))) {
        delete payload.id;
        delete payload.isDraft;
      }

      return payload;
    });

    this.inventoriesChange.emit(items as UpdateProductInventoryPayload[]);
  }
}
