export interface GeneralOptionQuery {
  page: number | null;
  search: string | null;
  active: number | null;
  per_page: number | null;
  manufacturer_id: string | null;
  vehicle_brand_id: string | null;
}

// ALTERNATIVA PRA PAGINAÇÃO
// {
//   page?: number;
//   limit?: number;
//   query?: string;
//   active?: boolean;
// }
