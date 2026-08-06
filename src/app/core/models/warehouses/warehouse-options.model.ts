export interface WarehouseOptionsResponse {
  success: boolean;
  message: string;
  data: WarehouseOption[];
}

export interface WarehouseOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
