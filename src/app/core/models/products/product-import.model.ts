export interface ImportProductItem {
  internal_code: string;
  name: string;
  category_id: string; // Nome da categoria escolhida na lista
  manufacturer_id: string; // Nome do fabricante escolhido na lista
  part_origin_id: string; // Nome da origem escolhida na lista
  unit_id: string; // Nome da unidade escolhida na lista
  barcode?: string | null;
}

export interface ProductImportPayload {
  products: ImportProductItem[];
}

export interface ProductImportResponse {
  process_id?: string;
  data?: {
    process_id: string;
  };
  message?: string;
  errors?: Record<string, string[] | string>;
}

export interface ProductImportSchemaFieldOption {
  id: string | number;
  name: string;
}

export interface ProductImportSchemaField {
  name: string;
  label: string;
  required: boolean;
  type: string;
  options?: ProductImportSchemaFieldOption[];
}

export interface ProductImportSchemaResponse {
  fields: ProductImportSchemaField[];
  max_rows: number;
}

export interface ProductImportStatusError {
  row: number;
  errors: string[];
}

export interface ProductImportStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  error_rows: number;
  errors?: ProductImportStatusError[];
}

export interface NormalizedProductRow {
  index: number;
  internal_code: string;
  name: string;
  category_id: string;
  manufacturer_id: string;
  part_origin_id: string;
  unit_id: string;
  barcode: string | null;
  raw: Record<string, unknown>;
  errors: string[];
}

