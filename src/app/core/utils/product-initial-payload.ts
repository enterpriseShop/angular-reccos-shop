import { ProductResponse } from '../models/products/product-response.model';

export const initialProductPayload: ProductResponse = {
  id: '',

  status: {
    id: '',
    module: '',
    code: '',
    name: '',
    color: '',
    icon: '',
  },

  category: {
    id: '',
    name: '',
    slug: '',
  },

  manufacturer: {
    id: '',
    name: '',
    slug: '',
  },

  part_origin: null,

  internal_code: '',
  barcode: null,

  name: '',
  slug: '',

  icon: null,
  image: null,

  short_description: null,
  description: '',

  weight: '0.000',
  height: '0.00',
  width: '0.00',
  length: '0.00',

  featured: false,
  active: null,

  is_sellable: false,
  commercial_status: '',

  unit: null,

  pricing: null,

  inventories: [],

  oem_codes: [],

  codes: [],

  equivalents: [],

  applications: [],

  suppliers: [],

  tags: [],

  created_at: '',
  updated_at: '',
};
