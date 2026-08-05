export interface UnitSaleOptionsResponse {
  success: boolean;
  message: string;
  data: UnitSaleOption[];
}

export interface UnitSaleOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
