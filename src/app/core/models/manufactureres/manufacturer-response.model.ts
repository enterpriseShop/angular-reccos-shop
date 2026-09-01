export interface ManufacturerResponse extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  website: string;
  active: boolean;
  image: null;
  created_at: string;
  updated_at: string;
}
