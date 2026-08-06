import {
  OemCodeItem,
  SupplierItem,
} from '../../../features/catalog/models/product-workspace.model';

export interface ProductResponse extends Record<string, unknown> {
  id: string;

  status: Status;
  category: Category;
  manufacturer: Category;
  part_origin: PartOrigin | null;
  unit: Unit | null;

  internal_code: string;
  barcode: string | null;

  name: string;
  slug: string;

  icon: string | null;
  image: string | null;

  short_description: string | null;
  description: string;

  weight: string;
  height: string;
  width: string;
  length: string;

  featured: boolean;
  active: boolean;

  is_sellable: boolean;
  commercial_status: string;

  pricing: Pricing | null;

  inventory: Inventory | null;

  oem_codes: OemCodeItem[];
  equivalents: SupplierItem[];
  applications: VehicleApplication[];
  suppliers: SupplierItem[];

  created_at: string;
  updated_at: string;
}

export interface Inventory {
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  allow_backorder: boolean;
  active: boolean;
}

export interface Pricing {
  regular_price: number;
  promotional_price: number;
  current_price: number;
  is_on_promotion: boolean;
  promotion_start: string;
  promotion_end: string;
  active: boolean;
  display: Display;
}

export interface Display {
  from: number;
  to: number;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Status {
  id: string;
  module: string;
  code: string;
  name: string;
  color: string;
  icon: string;
}

export interface OemCode {
  id: string;
  code: string;
  is_main: boolean;
  manufacturer: Category;
  manufacturer_code: string;
  created_at: string;
  updated_at: string;
}

export interface EquivalentProduct {
  id: string;
  type: string;
  reference_code: string;
  manufacturer: Category;
  manufacturer_code: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleApplication {
  id: string;
  manufacturer: string;
  model: string;
  year_from: number;
  year_to: number | null;
  engine: string | null;
  details: string | null;
  created_at: string;
  updated_at: string;
}

// export interface Supplier {
//   id: string;
//   name: string;
//   code: string | null;
//   cost_price: number;
//   delivery_time_days: number | null;
//   minimum_order_quantity: number;
//   active: boolean;
//   created_at: string;
//   updated_at: string;
// }

export interface Unit {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartOrigin {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}
