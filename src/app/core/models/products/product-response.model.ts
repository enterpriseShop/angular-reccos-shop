import { ProductVehicleApplication } from '../vehicle-application/vehicle-application-product.model';
import { ProductEquivalent } from '../equivalent/equivalent-products.model';
import { EntityReference } from '../generals/entity-reference';
import { ProductStatus } from '../status/status-product.model';
import { ProductSupplier } from '../suppliers/suppliers-product.model';
import { ProductPricing } from '../pricing/pricing-product-model';
import { ProductInventory } from '../inventories/inventories-product.model';
import { ProductUnitSale } from '../units-sale/unit-sale-product.model';
import { ProductPartOrigin } from '../part-origin/part-origin-product.model';
import { ProductAdditionalCodeSummary } from '../additional-codes/additional-codes-product.model';
import { ProductTag } from '../tags/tags-product.model';
import { OemCode } from '../oem-codes/oem-codes.model';

export interface ProductSummaryResponse {
  id: string;

  status: ProductStatus;
  category: EntityReference;
  manufacturer: EntityReference;

  internal_code: string;
  barcode: string | null;

  name: string;
  slug: string;

  icon: string | null;
  image: string | null;

  description: string;
  short_description: string | null;

  weight: string;
  height: string;
  width: string;
  length: string;

  featured: boolean;
  active: boolean | null;

  is_sellable: boolean;
  commercial_status: string;

  created_at: string;
  updated_at: string;
}

export interface ProductResponse extends ProductSummaryResponse {
  // Index signature para compatibilidade com DataTableComponent<T extends Record<string, unknown>>
  [key: string]: unknown;

  unit: ProductUnitSale | null;
  pricing: ProductPricing | null;
  inventories: ProductInventory[];
  codes: ProductAdditionalCodeSummary[];
  part_origin: ProductPartOrigin | null;

  tags: ProductTag[];
  oem_codes: OemCode[];
  suppliers: ProductSupplier[];
  equivalents: ProductEquivalent[];
  applications: ProductVehicleApplication[];
}
