import { ManufacturerSummaryResponse } from '../manufactureres/manufaturer-summary-response.model';

export interface OemCode {
  id: string;
  oem_code: string;
  manufacturer: ManufacturerSummaryResponse;
  created_at: string;
  updated_at: string;
}
