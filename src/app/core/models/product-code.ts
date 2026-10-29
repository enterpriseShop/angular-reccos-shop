export interface CreateProductCodeDto {
  product_id: string;
  code_type_id: string;
  code: string;
  status_id: string | null;
}

export interface UpdateProductCodeDto {
  product_id: string;
  code_type_id: string;
  code: string;
  status_id: string | null;
}

export interface CreateProductCodeTypeDto {
  name: string;
  description: string | null;
  status_id: string | null;
  active: boolean;
}

export interface UpdateProductCodeTypeDto {
  name: string;
  description: string | null;
  status_id: string | null;
  active: boolean;
}
