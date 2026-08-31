// export interface CategoryResponse {
//   id: string;
//   parent_id: null;
//   name: string;
//   slug: string;
//   description: string;
//   display_order: number;
//   icon: string;
//   image: string;
//   active: boolean;
//   created_at: string;
//   updated_at: string;
// }

export interface CategoryResponse extends Record<string, unknown> {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  icon: string | null;
  image: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  parent_name?: string;
}

export interface CreateCategoryPayload {
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number;
  icon?: string | null;
  image?: string | null;
  active?: boolean;
}

export interface UpdateCategoryPayload {
  parent_id?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  display_order?: number;
  icon?: string | null;
  image?: string | null;
  active?: boolean;
}
