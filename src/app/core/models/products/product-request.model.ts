export interface CreateProductPayload {
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  unit_id: string;

  internal_code: string;
  barcode: string;

  name: string;
  short_description: string;
  description: string;

  weight: number;
  height: number;
  width: number;
  length: number;

  featured: boolean;
}

export interface ProductCreateResponse {
  success: boolean;
  message: string;
  data: ProductCreate;
}

export interface ProductCreate {
  id: string;
  status: ProductStatus;
  internal_code: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  short_description: string;
  description: string;
  weight: string;
  height: string;
  width: string;
  length: string;
  featured: boolean;
  is_sellable: boolean;
  commercial_status: CommercialStatus;
}

export interface ProductStatus {
  id: string;
  module: string;
  code: string;
  name: string;
  color: string;
  icon: string;
}

export type CommercialStatus = 'pending' | 'approved' | 'rejected';

/**
 * Payload utilizado para atualização parcial de um produto.
 *
 * Os campos são opcionais porque o backend utiliza a regra
 * `sometimes` no UpdateProductRequest.
 *
 * Importante:
 * - `undefined` significa que o campo não será enviado.
 * - `null` é utilizado somente nos campos em que o backend
 *   permite explicitamente valor nulo.
 * - Arrays vazios devem ser enviados quando a intenção for
 *   persistir uma coleção vazia.
 */
export interface UpdateProductPayload {
  category_id?: string;
  manufacturer_id?: string;
  part_origin_id?: string | null;
  unit_id?: string | null;
  status_id?: string;

  oem_code_ids?: string[];
  product_code_ids?: string[];
  equivalent_product_ids?: string[];
  application_ids?: string[];
  supplier_ids?: string[];
  tag_ids?: string[];
  icon?: string | null;

  internal_code?: string;
  barcode?: string | null;

  name?: string;
  slug?: string;

  short_description?: string | null;
  description?: string;

  weight?: number;
  height?: number;
  width?: number;
  length?: number;

  featured?: boolean;
  active?: boolean;

  price?: UpdateProductPricePayload;

  inventories?: UpdateProductInventoryPayload[];
}

/**
 * Dados comerciais utilizados na atualização do produto.
 */
export interface UpdateProductPricePayload {
  price?: number;
  promotional_price?: number | null;
  promotion_start?: string | null;
  promotion_end?: string | null;
}

/**
 * Estoque de um produto por depósito.
 *
 * O backend aceita múltiplos registros em `inventories`.
 */
export interface UpdateProductInventoryPayload {
  id?: string | null;
  warehouse_id: string;
  quantity: number;
  minimum_quantity?: number | null;
  maximum_quantity?: number | null;
  allow_backorder?: boolean | null;
  active?: boolean | null;
  reserved_quantity?: number;
}

/**
 * Payload vazio para inicializar o sinal `productForm` antes de carregar um produto.
 */
export function defaultUpdatePayload(): UpdateProductPayload {
  return {};
}

/**
 * Converte a resposta da API (ProductResponse) no payload de atualização (UpdateProductPayload).
 *
 * Campos escalares são sempre mapeados.
 * Campos relacionais (oem_code_ids, tag_ids, etc.) são mantidos como `undefined`:
 * o backend ignora chaves ausentes (regra `array_key_exists`), portanto não haverá
 * alteração acidental nos relacionamentos ao salvar sem editar as abas correspondentes.
 * Cada aba de edição relacional é responsável por incluir o array correto no payload.
 */
export function mapResponseToPayload(prod: {
  category?: { id: string } | null;
  manufacturer?: { id: string } | null;
  part_origin?: { id: string } | null;
  unit?: { id: string } | null;
  status?: { id: string } | null;
  internal_code: string;
  barcode?: string | null;
  name: string;
  slug: string;
  short_description?: string | null;
  description: string;
  weight: string | number;
  height: string | number;
  width: string | number;
  length: string | number;
  featured: boolean;
  active?: boolean | null;
  pricing?: {
    regular_price?: number;
    promotional_price?: number | null;
    promotion_start?: string | null;
    promotion_end?: string | null;
  } | null;
  inventories?: {
    id?: string;
    warehouse: { id: string };
    quantity: number;
    reserved_quantity?: number;
    minimum_quantity?: number | null;
    maximum_quantity?: number | null;
    allow_backorder?: boolean;
    active?: boolean;
  }[];
}): UpdateProductPayload {
  return {
    // Referências (IDs de entidades relacionadas)
    category_id: prod.category?.id,
    manufacturer_id: prod.manufacturer?.id,
    part_origin_id: prod.part_origin?.id ?? null,
    unit_id: prod.unit?.id ?? null,
    status_id: prod.status?.id,

    // Campos escalares
    internal_code: prod.internal_code,
    barcode: prod.barcode ?? null,
    name: prod.name,
    slug: prod.slug,
    short_description: prod.short_description ?? null,
    description: prod.description,

    // Dimensões (API retorna como string, payload espera number)
    weight: parseFloat(String(prod.weight)) || 0,
    height: parseFloat(String(prod.height)) || 0,
    width: parseFloat(String(prod.width)) || 0,
    length: parseFloat(String(prod.length)) || 0,

    featured: prod.featured,
    active: prod.active ?? false,

    // Preço: incluído apenas se existir no produto
    price: prod.pricing
      ? {
          price: prod.pricing.regular_price,
          promotional_price: prod.pricing.promotional_price ?? null,
          promotion_start: prod.pricing.promotion_start ?? null,
          promotion_end: prod.pricing.promotion_end ?? null,
        }
      : undefined,

    // Inventário: incluído apenas se o produto já tiver estoque cadastrado
    inventories: prod.inventories
      ? prod.inventories.map((inv) => ({
          id: inv.id,
          warehouse_id: inv.warehouse.id,
          quantity: inv.quantity,
          reserved_quantity: inv.reserved_quantity || 0,
          minimum_quantity: inv.minimum_quantity ?? null,
          maximum_quantity: inv.maximum_quantity ?? null,
          allow_backorder: inv.allow_backorder ?? false,
          active: inv.active ?? true,
        }))
      : undefined,

    // Relacionamentos: undefined (não enviados) até o usuário editar a aba correspondente.
    // oem_code_ids: undefined,
    // product_code_ids: undefined,
    // equivalent_product_ids: undefined,
    // application_ids: undefined,
    // supplier_ids: undefined,
    // tag_ids: undefined,
  };
}
