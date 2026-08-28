export interface ProductPricing {
  regular_price: number;
  promotional_price: number | null;
  current_price: number;
  is_on_promotion: boolean;
  promotion_start: string | null;
  promotion_end: string | null;
  active: boolean;
}
