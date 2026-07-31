export interface StatusOptionsResponse {
  success: boolean;
  message: string;
  data: StatusOption[];
}

export interface StatusOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
