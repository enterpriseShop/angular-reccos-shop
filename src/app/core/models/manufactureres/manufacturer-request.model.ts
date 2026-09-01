export interface ManufacturerRequest {
  name: string;
  slug: string;
  website: string;
  active: boolean;
  image: string | File | null;
}
