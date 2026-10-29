import { ProductSummaryResponse } from '../../products/product-response.model';
import { StatusResponse } from '../../status/status-product.model';
import { ProductCodeTypeResponse } from '../product-code-type/product-code-type-response.model';

export interface ProductCodeResponse extends Record<string, unknown> {
  id: string;
  product_id: string;
  code_type_id: string;
  code: string;
  status: StatusResponse | null;
  product: ProductSummaryResponse | null;
  code_type: ProductCodeTypeResponse | null;
  created_at: string;
  updated_at: string;
}
