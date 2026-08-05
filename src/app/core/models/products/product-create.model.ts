import { AutocompleteOption } from '../../../design-system/autocomplete-select/autocomplete-select';
import { DSelectOption } from '../design-system/select-option.model';

/** Estado interno do formulário de criação (campos do POST) */
export interface ProductCreateFormState {
  categoryId: string;
  manufacturerId: string;
  partOriginId: string;
  unitId: string;
  internalCode: string;
  barcode: string;
  name: string;
  shortDescription: string;
  description: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  featured: boolean;
}

export function defaultProductCreateFormState(): ProductCreateFormState {
  return {
    categoryId: '',
    manufacturerId: '',
    partOriginId: '',
    unitId: '',
    internalCode: '',
    barcode: '',
    name: '',
    shortDescription: '',
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
    statusId: '',
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
  shortDescription: string;
  description: string;
  categoryId: string;
  manufacturerId: string;
  partOriginId: string;
  statusId: string;
  internalCode: string;
  barcode: string;
  unitId: string;
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
}

export interface ProductGeneralFormSource {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  manufacturerId: string;
  partOriginId: string;
  statusId: string;
  internalCode: string;
  barcode: string;
  unitId: string;
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
    shortDescription: source.shortDescription,
    description: source.description,
    categoryId: source.categoryId,
    manufacturerId: source.manufacturerId,
    partOriginId: source.partOriginId,
    statusId: source.statusId,
    internalCode: source.internalCode,
    barcode: source.barcode,
    unitId: source.unitId,
    weight: source.weight,
    height: source.height,
    width: source.width,
    length: source.length,
    featured: source.featured,
    active: source.active,
  };
}

export function toCreateProductPayload(source: ProductGeneralFormSource): CreateProductPayload {
  return {
    category_id: source.categoryId,
    manufacturer_id: source.manufacturerId,
    part_origin_id: source.partOriginId,
    unit_id: source.unitId,
    internal_code: source.internalCode,
    barcode: source.barcode,
    name: source.name,
    short_description: source.shortDescription,
    description: source.description,
    weight: source.weight,
    height: source.height,
    width: source.width,
    length: source.length,
    featured: source.featured,
  };
}
