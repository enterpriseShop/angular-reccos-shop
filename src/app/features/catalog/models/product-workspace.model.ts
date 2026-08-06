export type ProductWorkspaceMode = 'edit' | 'view' | 'create';

export type FormTab =
  | 'geral'
  | 'comercial'
  | 'inventario'
  | 'midia'
  | 'oem'
  | 'codigos'
  | 'fornecimento'
  | 'equivalentes'
  | 'compatibilidade'
  | 'tags'
  | 'observacoes'
  | 'classification'
  | 'logistics'
  | 'visibility';

export interface OemCodeItem {
  id: string;
  manufacturer: string;
  oemCode: string;
  isPrimary: boolean;
  status?: string;
}

export interface ProductCodeItem {
  id: string;
  type: string;
  code: string;
  status?: string;
}

export interface EquivalentProductItem {
  id: string;
  productName: string;
  notes: string;
  status?: string;
}

export interface VehicleApplicationItem {
  id: string;
  brand: string;
  model: string;
  version: string;
  engine: string;
  startYear: number;
  endYear: number;
  notes?: string;
  status?: string;
}

export interface MediaImageItem {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrimary: boolean;
  order: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export interface SupplierItem {
  id: string;
  supplierName: string;
  supplierCode: string;
  purchasePrice: number;
  leadTimeDays: number;
  isPreferential: boolean;
  minQuantity?: number;
  notes?: string;
  status?: string;
}

export interface ProductNoteItem {
  id: string;
  type: 'Geral' | 'Técnica' | 'Comercial' | 'Fiscal';
  description: string;
  date: string;
  author: string;
  status?: string;
}

export interface ProductFormData {
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  status_id: string;

  internal_code: string;
  barcode: string;

  name: string;
  slug: string;

  icon: string;
  image: string;

  short_description: string;
  description: string;

  weight: number;
  height: number;
  width: number;
  length: number;

  unit_id: string;

  featured: boolean;
  active: boolean;

  price: number;
  promotionalPrice: number | null;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  isInvoiced: boolean;

  warehouseId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  allowBackorder: boolean;

  oemCodes: OemCodeItem[];
  productCodes: ProductCodeItem[];
  equivalentProducts: EquivalentProductItem[];
  vehicleApplications: VehicleApplicationItem[];
  mediaImages: MediaImageItem[];
  suppliers: SupplierItem[];

  selectedTagIds: string[];

  productNotes: ProductNoteItem[];
}

export function defaultProductFormData(): ProductFormData {
  return {
    category_id: '',
    manufacturer_id: '',
    part_origin_id: '',
    status_id: 'st-01',

    internal_code: '',
    barcode: '',

    name: '',
    slug: '',

    icon: '',
    image: '',

    short_description: '',
    description: '',

    weight: 0,
    height: 0,
    width: 0,
    length: 0,

    unit_id: 'un',

    featured: false,
    active: true,

    price: 0,
    promotionalPrice: null,
    promotionStartDate: null,
    promotionEndDate: null,
    isInvoiced: true,

    warehouseId: 'wh-01',
    quantity: 0,
    minQuantity: 0,
    maxQuantity: null,
    allowBackorder: false,

    oemCodes: [],
    productCodes: [],
    equivalentProducts: [],
    vehicleApplications: [],
    mediaImages: [],
    suppliers: [],

    selectedTagIds: [],

    productNotes: [],
  };
}
