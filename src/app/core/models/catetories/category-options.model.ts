export interface CategoryOptionsResponse {
  success: boolean;
  message: string;
  data: CategoryOption[];
}

export interface CategoryOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
// 001400_ARARAS_PT1 => http://localhost:4200/#/my-farms/bagaco_03_30/72529