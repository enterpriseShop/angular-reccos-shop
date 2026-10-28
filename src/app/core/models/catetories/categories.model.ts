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

export interface CategoryRequest {
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number;
  icon?: string | null;
  image?: string | null;
  active?: boolean;
}
