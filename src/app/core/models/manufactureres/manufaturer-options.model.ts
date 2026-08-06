export interface ManufacturerOptionsResponse {
  success: boolean;
  message: string;
  data: ManufacturerOption[];
}

export interface ManufacturerOption {
  id: string;
  label: string;
  description: string;
}
