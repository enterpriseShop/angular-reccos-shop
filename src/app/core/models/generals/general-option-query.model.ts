export interface GeneralOptionQuery {
  search: string | null;
  active: boolean | null;
  per_page: number | null;
  page: number | null;
  manufacturer_id: string | null;
}

// ALTERNATIVA PRA PAGINAÇÃO
// {
//   page?: number;
//   limit?: number;
//   query?: string;
//   active?: boolean;
// }
