import { AutocompleteOption } from '../../../design-system/autocomplete-select/autocomplete-select';
import { DSelectOption } from '../design-system/select-option.model';

/** Estado interno do formulário de criação (campos do POST) */
export interface ProductCreateFormState {
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

export function defaultProductCreateFormState(): ProductCreateFormState {
  return {
    category_id: '',
    manufacturer_id: '',
    part_origin_id: '',
    unit_id: '',
    internal_code: '',
    barcode: '',
    name: '',
    short_description: '',
    description: '',
    weight: 0,
    height: 0,
    width: 0,
    length: 0,
    featured: false,
  };
}

export function createFormToGeneralSource(state: ProductCreateFormState): ProductGeneralFormSource {
  return {
    ...state,
    slug: '',
    status_id: '',
    active: true,
  };
}

/** Payload esperado pelo backend no POST /product */
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

/** Campos da aba Geral compartilhados entre create e workspace */
export interface ProductGeneralFormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  status_id: string;
  internal_code: string;
  barcode: string;
  unit_id: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  featured: boolean;
  active: boolean;
}

export interface ProductGeneralFormOptions {
  categoryOptions: AutocompleteOption[];
  categoryLoading: boolean;
  manufacturerOptions: AutocompleteOption[];
  manufacturerLoading: boolean;
  partOriginOptions: DSelectOption[];
  unitOptions: DSelectOption[];
  statusOptions: DSelectOption[];
  warehouseOptions: DSelectOption[];
}

export interface ProductGeneralFormSource {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  status_id: string;
  internal_code: string;
  barcode: string;
  unit_id: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  featured: boolean;
  active: boolean;
}

export function toProductGeneralFormData(source: ProductGeneralFormSource): ProductGeneralFormData {
  return {
    name: source.name,
    slug: source.slug,
    short_description: source.short_description,
    description: source.description,
    category_id: source.category_id,
    manufacturer_id: source.manufacturer_id,
    part_origin_id: source.part_origin_id,
    status_id: source.status_id,
    internal_code: source.internal_code,
    barcode: source.barcode,
    unit_id: source.unit_id,
    weight: source.weight,
    height: source.height,
    width: source.width,
    length: source.length,
    featured: source.featured,
    active: source.active,
  };
}

export function toCreateProductPayload(source: ProductGeneralFormSource): CreateProductPayload {
  console.log('[CHEGAMOS AQUI PAYLOAD]', source);
  return {
    category_id: source.category_id,
    manufacturer_id: source.manufacturer_id,
    part_origin_id: source.part_origin_id,
    unit_id: source.unit_id,
    internal_code: source.internal_code,
    barcode: source.barcode,
    name: source.name,
    short_description: source.short_description,
    description: source.description,
    weight: source.weight,
    height: source.height,
    width: source.width,
    length: source.length,
    featured: source.featured,
  };
}
