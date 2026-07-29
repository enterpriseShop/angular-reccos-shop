export interface ProductResponse extends Record<string, unknown> {
  id: string;
  status: Status;
  category: Category;
  manufacturer: Category;
  internal_code: string;
  name: string;
  slug: string;
  icon: null;
  image: null;
  short_description: string;
  description: string;
  weight: string;
  height: string;
  width: string;
  length: string;
  featured: boolean;
  active: number;
  is_sellable: boolean;
  commercial_status: string;
  pricing: Pricing;
  inventory: Inventory;
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
