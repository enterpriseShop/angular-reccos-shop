export interface CreateProductEquivalentDto {
  product_id: string;
  equivalent_product_id: string;
  observation?: string | null;
}

export interface UpdateProductEquivalentDto {
  product_id?: string;
  equivalent_product_id?: string;
  observation?: string | null;
}
