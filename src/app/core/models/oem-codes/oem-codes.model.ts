import { ProductSummaryResponse } from '../products/product-summary-response';
import { ManufacturerSummaryResponse } from '../manufactureres/manufaturer-summary-response.model';

export interface OemCode {
  id: string;
  label: string;
  product: ProductSummaryResponse;
  manufacturer: ManufacturerSummaryResponse;
  created_at: string;
  updated_at: string;
}
