import { ProductFormState } from '../models/products/product-form-state.model';
import {
  CreateProductPayload,
  UpdateProductPayload,
} from '../models/products/product-request.model';

export function toBoolean(val: unknown): boolean {
  if (val === true || val === 1 || val === 'true' || val === '1') {
    return true;
  }
  if (val === false || val === 0 || val === 'false' || val === '0') {
    return false;
  }
  return Boolean(val);
}

export function toNumber(val: unknown): number {
  const parsed = parseFloat(String(val));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function toInteger(val: unknown): number {
  const parsed = parseInt(String(val), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function toNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined || String(val).trim() === '') {
    return null;
  }
  const parsed = parseFloat(String(val));
  return Number.isNaN(parsed) ? null : parsed;
}

export function toNullableString(val: unknown): string | null {
  if (val === null || val === undefined || String(val).trim() === '') {
    return null;
  }
  return String(val).trim();
}

export function toNullableDate(val: unknown): string | null {
  const normalized = toNullableString(val);
  if (!normalized) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
    return normalized.replace('T', ' ').slice(0, 19);
  }

  return normalized;
}

function hasPromotionalPrice(promotionalPrice: number | null): boolean {
  return promotionalPrice !== null && promotionalPrice !== undefined && String(promotionalPrice).trim() !== '';
}

function buildPriceBlock(state: ProductFormState) {
  const hasPromotion = hasPromotionalPrice(state.promotional_price);

  return {
    price: toNumber(state.price),
    promotional_price: hasPromotion ? toNullableNumber(state.promotional_price) : null,
    promotion_start: hasPromotion ? toNullableDate(state.promotion_start_date) : null,
    promotion_end: hasPromotion ? toNullableDate(state.promotion_end_date) : null,
  };
}

function buildInventoryBlock(state: ProductFormState) {
  return {
    warehouse_id: toNullableString(state.warehouse_id),
    quantity: toInteger(state.quantity),
    minimum_quantity: toInteger(state.minimum_quantity),
    maximum_quantity: toNullableNumber(state.maximum_quantity),
    allow_backorder: toBoolean(state.allow_backorder),
  };
}

function buildProductRoot(state: ProductFormState) {
  return {
    category_id: toNullableString(state.category_id),
    manufacturer_id: toNullableString(state.manufacturer_id),
    status_id: toNullableString(state.status_id),
    internal_code: toNullableString(state.internal_code),
    name: toNullableString(state.name),
    slug: toNullableString(state.slug),
    icon: null,
    image: null,
    short_description: null,
    description: toNullableString(state.description),
    weight: toNumber(state.weight),
    height: toNumber(state.height),
    width: toNumber(state.width),
    length: toNumber(state.length),
    active: true,
    featured: false,
    unit: toNullableString(state.unit),
  };
}

export function transformToCreatePayload(state: ProductFormState): CreateProductPayload {
  const extended = state as ProductFormState & {
    part_origin_id?: string;
    barcode?: string;
    short_description?: string;
    featured?: boolean;
  };

  return {
    category_id: toNullableString(state.category_id) ?? '',
    manufacturer_id: toNullableString(state.manufacturer_id) ?? '',
    part_origin_id: toNullableString(extended.part_origin_id) ?? '',
    unit_id: toNullableString(state.unit) ?? '',
    internal_code: toNullableString(state.internal_code) ?? '',
    barcode: toNullableString(extended.barcode) ?? '',
    name: toNullableString(state.name) ?? '',
    short_description: toNullableString(extended.short_description) ?? '',
    description: toNullableString(state.description) ?? '',
    weight: toNumber(state.weight),
    height: toNumber(state.height),
    width: toNumber(state.width),
    length: toNumber(state.length),
    featured: toBoolean(extended.featured),
  };
}

export function transformToUpdatePayload(state: ProductFormState): UpdateProductPayload {
  return buildProductRoot(state);
}

export function validateProductForm(
  state: ProductFormState,
  mode: 'create' | 'edit' | 'view',
): Record<string, string> {
  const errs: Record<string, string> = {};
  const isCreateFlow = mode === 'create';

  if (!state.name.trim()) {
    errs['name'] = 'O nome do produto é obrigatório.';
  }
  if (!state.internal_code.trim()) {
    errs['internal_code'] = 'O código interno é obrigatório.';
  }
  if (!state.category_id) {
    errs['category_id'] = 'Selecione uma categoria.';
  }
  if (!state.manufacturer_id) {
    errs['manufacturer_id'] = 'Selecione um fabricante.';
  }
  if (!state.unit) {
    errs['unit_id'] = 'Selecione a unidade de medida.';
  }
  if (!state.status_id) {
    errs['status_id'] = 'Selecione o status do produto.';
  }

  if (isCreateFlow) {
    const priceVal = state.price;
    if (priceVal <= 0) {
      errs['price'] = 'Informe um preço base válido superior a zero.';
    }

    const hasPromoPrice = hasPromotionalPrice(state.promotional_price);
    const hasStartDate = !!state.promotion_start_date?.trim();
    const hasEndDate = !!state.promotion_end_date?.trim();

    if (hasPromoPrice) {
      const parsedPromoPrice = Number(state.promotional_price);
      if (Number.isNaN(parsedPromoPrice) || parsedPromoPrice <= 0) {
        errs['promotional_price'] = 'Informe um preço promocional válido.';
      } else if (parsedPromoPrice >= priceVal) {
        errs['promotional_price'] = 'O preço promocional deve ser menor que o preço base.';
      }

      if (!hasStartDate) {
        errs['promotion_start_date'] =
          'A data de início da promoção é obrigatória quando há preço promocional.';
      }
      if (!hasEndDate) {
        errs['promotion_end_date'] =
          'A data de término da promoção é obrigatória quando há preço promocional.';
      }
    }

    if (hasStartDate || hasEndDate) {
      if (!hasPromoPrice) {
        errs['promotional_price'] =
          'O preço promocional é obrigatório quando as datas da promoção são informadas.';
      }
    }

    if (!state.warehouse_id) {
      errs['warehouse_id'] = 'Selecione o depósito.';
    }

    if (state.quantity === null || state.quantity === undefined || Number.isNaN(state.quantity)) {
      errs['quantity'] = 'A quantidade inicial é obrigatória.';
    }

    const minQty = state.minimum_quantity;
    if (minQty < 0) {
      errs['min_quantity'] = 'A quantidade mínima deve ser maior ou igual a zero.';
    }

    const maxQty = state.maximum_quantity;
    if (maxQty !== null && maxQty !== undefined && String(maxQty).trim() !== '') {
      const parsedMaxQty = Number(maxQty);
      if (Number.isNaN(parsedMaxQty)) {
        errs['max_quantity'] = 'A quantidade máxima deve ser um número válido.';
      } else if (parsedMaxQty < minQty) {
        errs['max_quantity'] = 'A quantidade máxima deve ser maior ou igual à quantidade mínima.';
      }
    }
  }

  return errs;
}

export function mapProductBackendErrors(
  backendErrors: Record<string, string[]>,
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const key of Object.keys(backendErrors)) {
    const messages = backendErrors[key];
    const message = messages && messages.length > 0 ? messages[0] : '';
    if (!message) continue;

    if (key === 'price.price') {
      mapped['price'] = message;
    } else if (key === 'price.promotional_price') {
      mapped['promotional_price'] = message;
    } else if (key === 'price.promotion_start') {
      mapped['promotion_start_date'] = message;
    } else if (key === 'price.promotion_end') {
      mapped['promotion_end_date'] = message;
    } else if (key === 'inventory.warehouse_id') {
      mapped['warehouse_id'] = message;
    } else if (key === 'inventory.quantity') {
      mapped['quantity'] = message;
    } else if (key === 'inventory.minimum_quantity') {
      mapped['min_quantity'] = message;
    } else if (key === 'inventory.maximum_quantity') {
      mapped['max_quantity'] = message;
    } else if (key === 'inventory.allow_backorder') {
      mapped['allow_backorder'] = message;
    } else {
      mapped[key] = message;
    }
  }

  return mapped;
}
